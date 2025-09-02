import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class GetPupularBrandsQueryDTO {
  @ApiProperty({
    example: 5,
    default: 10,
    description:
      'Максимальное количество возвращаемых брендов (по умолчанию 10)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  limit?: number = 10;
}
