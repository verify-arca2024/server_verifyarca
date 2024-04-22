import { IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Length(6, 6)
  code: string;

  @IsString()
  password: string;
}
