import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JWTAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: { user: User }) {
    return this.postsService.create(createPostDto, req.user);
  }
  @Get()
  findAll() {
    return this.postsService.findAll();
  }
  @Get('users/:userId')
  findAllByUser(@Param('userId') userId: number) {
    return this.postsService.findAllByUser(userId);
  }
  @Get(':id')
  findOne(@Param('id') id: number, @Req() req: { user: User }) {
    return this.postsService.findOne(id, req.user);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.postsService.findOne(+id);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: { user: User },
  ) {
    return this.postsService.update(+id, updatePostDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: User }) {
    return this.postsService.remove(+id, req.user);
  }
}
