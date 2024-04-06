import { IsString, Length } from 'class-validator';

export class VerifyDto {
  @IsString()
  @Length(6, 6)
  code: string;
}
