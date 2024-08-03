import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Auth } from './models/auth.model';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<Auth> {
    return this.authService.register(createUserDto);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<Auth> {
    return this.authService.login(loginDto);
  }
}
