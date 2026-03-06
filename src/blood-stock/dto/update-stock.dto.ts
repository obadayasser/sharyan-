import { IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BloodType, StockLevel } from '@prisma/client';

export class UpdateStockDto {
  @ApiProperty({ enum: BloodType })
  @IsEnum(BloodType)
  bloodType: BloodType;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  bagsCount: number;

  @ApiProperty({ enum: StockLevel })
  @IsEnum(StockLevel)
  stockLevel: StockLevel;
}
