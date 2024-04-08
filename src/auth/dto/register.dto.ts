// register.dto.ts

import {
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsString,
  MinLength,
  MaxLength,
  Matches,
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
  @MinLength(3)
  @MaxLength(20)
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  lastname: string;

  @IsNotEmpty()
  @IsString()
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  password: string;
}
