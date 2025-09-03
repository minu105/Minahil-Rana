import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() name: string;
  @IsString() username: string;
  @IsEmail() email: string;
  @MinLength(6) password: string;
  @MinLength(6) confirmPassword: string;
  @IsOptional() @IsString() phone?: string;
  @IsBoolean() termsAccepted: boolean;
  @IsOptional() @IsString() captchaToken?: string;
}
export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}
