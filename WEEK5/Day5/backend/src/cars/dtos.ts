import { ArrayNotEmpty, IsArray, IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCarDto {
  @IsString() title: string;
  @IsString() make: string;
  @IsString() model: string;
  @IsInt() @Min(1950) @Max(2100) year: number;
  @IsIn(['sedan','hatchback','suv','sports','convertible','coupe','other']) bodyType: string;
  @IsOptional() @IsNumber() mileage?: number;
  @IsOptional() @IsString() engineSize?: string;
  @IsOptional() @IsIn(['original','partially_repainted','totally_repainted']) paintStatus?: string;
  @IsOptional() @IsBoolean() hasGccSpecs?: boolean;
  @IsOptional() @IsIn(['yes','no']) accidentHistory?: string;
  @IsOptional() @IsBoolean() fullServiceHistory?: boolean;
  @IsOptional() @IsString() description?: string;
  @IsArray() @ArrayNotEmpty() photos: string[];
}
