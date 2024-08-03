import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/models/user.model';

export class Auth {
  @ApiProperty()
  user: User;

  @ApiProperty()
  accessToken: string;
}
