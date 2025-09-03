import { IsNotEmpty, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/)
  name: string; // slug

  @IsNotEmpty()
  displayName: string;
}
