import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProducImage } from './entities';
import { PlainProduct } from './interfaces/plain-product.interface';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProducImage)
    private readonly productImgsRepo: Repository<ProducImage>,
  ) {}

  async create(data: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = data;

      const product = this.productRepo.create({
        ...productDetails,
        images: images.map((img) => this.productImgsRepo.create({ url: img })),
        user,
      });
      await this.productRepo.save(product);

      return { ...product, images: images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(pags: PaginationDto) {
    const { limit = 10, offset = 0 } = pags;

    const products = await this.productRepo.find({
      skip: offset,
      take: limit,
      relations: { images: true },
    });

    return products.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;

    try {
      if (isUUID(term)) {
        product = await this.productRepo.findOneBy({ id: term });
      } else {
        const query = this.productRepo.createQueryBuilder('prod');
        product = await query
          .where('LOWER(title) =:title or slug =:slug', {
            title: term.toLowerCase(),
            slug: term,
          })
          .leftJoinAndSelect('prod.images', 'prodImgs')
          .getOne();
      }

      if (!product) throw new NotFoundException('Product not found');

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOnePlain(term: string): Promise<PlainProduct> {
    const { images = [], ...product } = await this.findOne(term);
    return {
      ...product,
      images: images.map((img) => img.url),
    };
  }

  async update(id: string, data: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = data;

    const product = await this.productRepo.preload({ id, ...toUpdate });
    if (!product) throw new NotFoundException('Product to Update not found');

    const queryRunner = await this.initQueryRunner();

    try {
      if (images) {
        await queryRunner.manager.delete(ProducImage, { product: { id } });

        product.images = images.map((img) =>
          this.productImgsRepo.create({ url: img }),
        );
      }

      product.user = user;
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id);
      await this.productRepo.remove(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      `${error.detail} with code ${error.code}`,
    );
  }

  async deleteAllProducts() {
    const query = this.productRepo.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private async initQueryRunner(dataSource = this.dataSource) {
    // Create QueryRunner
    // En el QueryRunner se establecen una serie de pasos que se ejecutaran en la base cuando se ejecute el commit.
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    return queryRunner;
  }
}
