import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth()
  @Post()
  @Auth()
  create(@GetUser() user: User, @Body() data: CreateProductDto) {
    return this.productsService.create(data, user);
  }

  @ApiBearerAuth()
  @Get()
  @Auth(ValidRoles.user)
  findAll(@Query() pags: PaginationDto) {
    return this.productsService.findAll(pags);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlain(term);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Auth(ValidRoles.user)
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
