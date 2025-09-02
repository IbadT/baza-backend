import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class GetPupularSizesQueryDTO {
  @ApiProperty({
    example: 16,
    description: 'Минимальный диаметр (в дюймах) для включения в результаты.',
    minimum: 1,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Min(1, { message: 'Минимальный диаметр не соответствует' })
  minDiameter: number;

  @ApiProperty({
    example: 20,
    description: 'Максимальный диаметр (в дюймах) для включения в результаты.',
    maximum: 1000,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Max(1000, { message: 'Максимальный диаметр не соответствует' })
  maxDiameter: number;

  @ApiProperty({
    example: 3,
    description:
      'Максимальное количество размеров для каждого диаметра (по умолчанию 5).',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  limitPerDiameter?: number;
}
