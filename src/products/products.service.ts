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
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(data: CreateProductDto) {
    try {
      const product = this.productRepo.create(data);
      await this.productRepo.save(product);

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(pags: PaginationDto) {
    const { limit = 10, offset = 0 } = pags;

    return await this.productRepo.find({
      skip: offset,
      take: limit,
    });
  }

  async findOne(term: string) {
    let product: Product;

    try {
      if (isUUID(term)) {
        product = await this.productRepo.findOne({
          where: { id: term },
        });
      } else {
        const query = this.productRepo.createQueryBuilder();
        product = await query
          .where('LOWER(title) =:title or slug =:slug', {
            title: term.toLowerCase(),
            slug: term,
          })
          .getOne();
      }

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(id: string, data: UpdateProductDto) {
    const product = await this.productRepo.preload({ id: id, ...data });
    if (!product) throw new NotFoundException('Product not found');

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
