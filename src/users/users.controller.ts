import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from './entities/user.entity';
@UseInterceptors(ClassSerializerInterceptor)
@ApiBasicAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'The records have been successfully retrieved.',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'The record has been successfully retrieved.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(JWTAuthGuard)
  @Patch(':id')
  @ApiOkResponse({ description: 'The record has been successfully updated.' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: { user: User },
  ) {
    return this.usersService.update(+id, updateUserDto, req.user);
  }

  @UseGuards(JWTAuthGuard)
  @Delete(':id')
  @ApiNoContentResponse({
    description: 'The record has been successfully deleted.',
  })
  remove(@Param('id') id: string, @Req() req: { user: User }) {
    return this.usersService.remove(+id, req.user);
  }
}
