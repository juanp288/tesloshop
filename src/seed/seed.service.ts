import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/data.seed';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {}

  async run() {
    await this.insertNewProdcuts();
    return 'This action executed a seed';
  }

  private async insertNewProdcuts() {
    await this.productService.deleteAllProducts();
    const { products } = initialData;

    await Promise.all(
      products.map((product) => this.productService.create(product)),
    );

    return true;
  }
}
