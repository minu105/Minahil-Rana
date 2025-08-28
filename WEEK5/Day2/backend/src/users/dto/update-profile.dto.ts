import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(50) name?: string;
  @IsOptional() @IsString() @MaxLength(160) bio?: string;
  @IsOptional() @IsUrl() avatarUrl?: string;
}
