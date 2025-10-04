import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../entities/payment.entity';

export class CreateCustomerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Acme Corporation', required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ example: '+998901234567', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: '123 Main Street, City', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateCustomerDto {
  @ApiProperty({ example: 'John Smith', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Smith & Co', required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({ example: '+998907654321', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: '456 Oak Street, City', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isActive?: boolean;
}

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-of-customer' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 'uuid-of-sale', required: false })
  @IsUUID()
  @IsOptional()
  saleId?: string;

  @ApiProperty({ example: 50.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: 'Payment for outstanding debt', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}