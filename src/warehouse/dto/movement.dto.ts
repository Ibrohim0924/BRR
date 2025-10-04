import { IsString, IsNotEmpty, IsEnum, IsNumber, IsUUID, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MovementType } from '../../entities/warehouse-movement.entity';

export class CreateMovementDto {
  @ApiProperty({ example: 'uuid-of-raw-material' })
  @IsUUID()
  @IsNotEmpty()
  rawMaterialId: string;

  @ApiProperty({ enum: MovementType, example: MovementType.IN })
  @IsEnum(MovementType)
  type: MovementType;

  @ApiProperty({ example: 50 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 1.5, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  unitCost?: number;

  @ApiProperty({ example: 'Received from supplier', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'uuid-of-user' })
  @IsUUID()
  @IsNotEmpty()
  createdById: string;
}