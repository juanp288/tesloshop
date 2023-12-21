import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ default: 10, description: 'Cantidad maxima de registros' })
  @IsOptional()
  @IsPositive()
  @Min(1)
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({ default: 0, description: 'Registros saltados' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}
