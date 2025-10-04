import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from '../../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ example: 'Fresh Bread' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ProductType, example: ProductType.NON })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty({ example: 2.50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({ example: 'piece' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 100, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentStock?: number = 0;
}

export class UpdateProductDto {
  @ApiProperty({ example: 'Premium Fresh Bread', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: ProductType, required: false })
  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @ApiProperty({ example: 3.00, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 'loaf', required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isActive?: boolean;
}