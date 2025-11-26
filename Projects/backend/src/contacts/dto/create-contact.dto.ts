import { IsEmail, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsInt()
  property_id?: number;
}
