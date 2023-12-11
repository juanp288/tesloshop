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
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProducImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProducImage)
    private readonly productImgsRepo: Repository<ProducImage>,
  ) {}

  async create(data: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = data;

      const product = this.productRepo.create({
        ...productDetails,
        images: images.map((img) => this.productImgsRepo.create({ url: img })),
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

  async findOnePlain(term: string) {
    const { images = [], ...product } = await this.findOne(term);
    return {
      ...product,
      images: images.map((img) => img.url),
    };
  }

  async update(id: string, data: UpdateProductDto) {
    const product = await this.productRepo.preload({
      id: id,
      ...data,
      images: [],
    });

    try {
      return this.productRepo.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id);
      return await this.productRepo.remove(product);
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
}
