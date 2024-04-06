// register.dto.ts

import {
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsString()
  name: string;

  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
