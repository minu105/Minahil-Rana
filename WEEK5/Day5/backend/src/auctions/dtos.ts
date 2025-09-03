import { IsArray, IsBoolean, IsDateString, IsInt, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAuctionDto {
  @IsMongoId() carId: string;
  @IsNumber() @Min(0) startPrice: number;
  @IsInt() @Min(1) minIncrement: number;
  @IsDateString() startAt: string;
  @IsDateString() endAt: string;
}
export class UpdateAuctionDto {
  @IsOptional() @IsInt() @Min(1) minIncrement?: number;
  @IsOptional() @IsDateString() startAt?: string;
  @IsOptional() @IsDateString() endAt?: string;
  @IsOptional() @IsString() status?: 'scheduled' | 'live' | 'ended' | 'completed' | 'cancelled';
}

export class CreateAuctionWithCarDto {
  // Car fields
  @IsString() title: string;
  @IsString() make: string;
  @IsString() model: string;
  @IsInt() year: number;
  @IsString() bodyType: string;
  @IsOptional() @IsNumber() mileage?: number;
  @IsOptional() @IsString() engineSize?: string;
  @IsOptional() @IsString() paintStatus?: string;
  @IsOptional() @IsBoolean() hasGccSpecs?: boolean;
  @IsOptional() @IsString() accidentHistory?: string;
  @IsOptional() @IsBoolean() fullServiceHistory?: boolean;
  @IsOptional() @IsArray() photos?: string[];

  // Auction fields
  @IsNumber() @Min(0) startPrice: number;
  @IsInt() @Min(1) minIncrement: number;
  @IsDateString() startAt: string;
  @IsDateString() endAt: string;
}
