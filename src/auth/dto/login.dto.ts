import { IsDefined, IsString } from 'class-validator';

export class LoginDto {
  @IsDefined()
  @IsString()
  readonly username: string;

  @IsDefined()
  @IsString()
  readonly password: string;
}
