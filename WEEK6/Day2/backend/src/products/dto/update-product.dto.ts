import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto, VariantDto } from './create-product.dto';
import { IsArray, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class UpdateVariantsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  @IsOptional()
  variants?: VariantDto[];

  @IsArray()
  @IsOptional()
  removeSkus?: string[]; // remove by sku
}
