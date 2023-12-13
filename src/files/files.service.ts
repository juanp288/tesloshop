import { join } from 'path';
import * as fs from 'fs';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/products', imageName);

    if (!fs.existsSync(path))
      throw new BadRequestException(`No product found with image ${imageName}`);

    return path;
  }
}
