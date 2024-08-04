import { HttpException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  getAccessToken(user: User): string {
    return this.jwtService.sign({ sub: user.id, username: user.username });
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      user,
      accessToken: this.getAccessToken(user),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByField(
      loginDto.username,
      'username',
    );
    if (!user) throw new HttpException('Invalid credentials', 401);

    const bcrypt = require('bcrypt');
    if (!(await bcrypt.compare(loginDto.password, user.password)))
      throw new HttpException('Invalid credentials', 401);

    return {
      user,
      accessToken: this.getAccessToken(user),
    };
  }
}
