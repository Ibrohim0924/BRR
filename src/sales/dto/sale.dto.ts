import { IsString, IsNotEmpty, IsEnum, IsNumber, IsUUID, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentType } from '../../entities/sale.entity';

export class CreateSaleItemDto {
  @ApiProperty({ example: 'uuid-of-product' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 2.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  unitPrice: number;
}

export class CreateSaleDto {
  @ApiProperty({ example: 'uuid-of-customer' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiProperty({ enum: PaymentType, example: PaymentType.CASH })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({ example: 25.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number = 0;

  @ApiProperty({ example: 'Customer paid in cash', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReturnItemDto {
  @ApiProperty({ example: 'uuid-of-sale-item' })
  @IsUUID()
  @IsNotEmpty()
  saleItemId: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  returnQuantity: number;

  @ApiProperty({ example: 'Damaged goods', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}