import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MaterialType } from '../../entities/raw-material.entity';

export class CreateRawMaterialDto {
  @ApiProperty({ example: 'Flour' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: MaterialType, example: MaterialType.FLOUR })
  @IsEnum(MaterialType)
  type: MaterialType;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentStock?: number = 0;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minStockLevel?: number = 0;

  @ApiProperty({ example: 1.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPerUnit?: number = 0;
}

export class UpdateRawMaterialDto {
  @ApiProperty({ example: 'Flour Premium', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: MaterialType, required: false })
  @IsEnum(MaterialType)
  @IsOptional()
  type?: MaterialType;

  @ApiProperty({ example: 'kg', required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ example: 15, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minStockLevel?: number;

  @ApiProperty({ example: 1.8, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPerUnit?: number;
}