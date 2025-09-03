import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class GetProductQueryDTO {
  @ApiProperty({
    example: 'tires',
    description: 'Категория: wheels (диски)',
    required: true,
    enum: ['tires', 'wheels'],
    // enum: ["wheels"],
  })
  @IsString({ message: 'Поле должно быть строкой' })
  @IsIn(['tires', 'wheels'], {
    message: 'Выбрана неверная категория',
  })
  readonly category: string;

  @ApiProperty({
    example: 1,
    description: 'Номер страницы',
    required: true,
    minimum: 1,
    type: Number,
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1, { message: 'Страница должна быть больше 0' })
  readonly page: number;

  @ApiProperty({
    example: 10,
    description: 'Количество товаров на странице',
    required: true,
    minimum: 1,
    type: Number,
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1, { message: 'Количество должно быть больше 0' })
  readonly limit: number;

  @ApiProperty({
    example: 'price_asc',
    description: 'Сортировка',
    required: false,
    enum: ['price_asc', 'price_desc', 'rating_desc', 'newest'],
    default: 'price_asc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['price_asc', 'price_desc', 'rating_desc', 'newest'], {
    message: 'Выбрана неверная сортировка',
  })
  readonly sortdBy?: string;

  // ===== tires-only filters (optional) =====
  @ApiProperty({ required: false, type: Number, example: 275 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  readonly width1?: number;

  @ApiProperty({ required: false, type: Number, example: 40 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  readonly height1?: number;

  @ApiProperty({ required: false, type: Number, example: 20 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  readonly diameter1?: number;

  @ApiProperty({ required: false, type: Number, example: 315 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  readonly width2?: number;

  @ApiProperty({ required: false, type: Number, example: 35 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  readonly height2?: number;

  @ApiProperty({ required: false, type: Number, example: 20 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  readonly diameter2?: number;

  @ApiProperty({
    required: false,
    type: [String],
    example: ['Michelin', 'Pirelli'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value];
    }
    if (Array.isArray(value)) {
      return value as string[];
    }
    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  readonly brand?: string[];

  @ApiProperty({ required: false, type: Boolean, example: true })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  readonly spikes?: boolean;

  @ApiProperty({ required: false, type: String, example: 'направленный' })
  @IsOptional()
  @IsString()
  readonly treadPattern?: string;

  @ApiProperty({ required: false, type: Boolean, example: true })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  readonly runFlat?: boolean;

  @ApiProperty({
    required: false,
    type: [String],
    example: ['summer', 'winter'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value];
    }
    return Array.isArray(value) ? (value as string[]) : undefined;
  })
  @IsArray()
  @IsString({ each: true })
  readonly season?: string[];

  @ApiProperty({ required: false, type: Number, example: 5000 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  readonly priceMin?: number;

  @ApiProperty({ required: false, type: Number, example: 20000 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  readonly priceMax?: number;

  @ApiProperty({ required: false, type: Number, example: 2 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly minQuantity?: number;
}
