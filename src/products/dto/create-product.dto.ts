import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNumber,
  IsPositive,
  IsOptional,
  IsInt,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  @ApiProperty()
  title: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiProperty()
  price?: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  description?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  slug?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @ApiProperty()
  stock?: number;

  @IsString({ each: true })
  @IsArray()
  @ApiProperty({ default: [] })
  sizes: string[];

  @IsIn(['men', 'women', 'kid', 'unisex'])
  @ApiProperty()
  gender: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty({ default: [] })
  tags?: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty({ default: [] })
  images?: string[];
}
