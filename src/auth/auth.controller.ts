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
import {
  ApiCreatedResponse,
  ApiNotAcceptableResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @ApiCreatedResponse({ type: Auth })
  @ApiNotAcceptableResponse({ description: 'Username already exists' })
  async register(@Body() createUserDto: CreateUserDto): Promise<Auth> {
    return this.authService.register(createUserDto);
  }
  @Post('login')
  @ApiOkResponse({ type: Auth })
  @ApiNotAcceptableResponse({ description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<Auth> {
    return this.authService.login(loginDto);
  }
}
