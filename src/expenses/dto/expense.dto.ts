import { IsString, IsNotEmpty, IsEnum, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '../../entities/expense.entity';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Monthly electricity bill' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ExpenseCategory, example: ExpenseCategory.ELECTRICITY })
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiProperty({ example: 150.75 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Paid via bank transfer', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateExpenseDto {
  @ApiProperty({ example: 'Monthly electricity bill - updated', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ExpenseCategory, required: false })
  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @ApiProperty({ example: 175.50, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @ApiProperty({ example: '2024-01-16', required: false })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ example: 'Updated payment method', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}