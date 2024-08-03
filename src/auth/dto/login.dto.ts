import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class LoginDto {
  @IsDefined()
  @IsString()
  @ApiProperty()
  readonly username: string;

  @IsDefined()
  @IsString()
  @ApiProperty()
  readonly password: string;
}
