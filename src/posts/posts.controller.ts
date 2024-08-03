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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JWTAuthGuard)
@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiCreatedResponse({ type: Post })
  @ApiBody({ type: CreatePostDto })
  create(@Body() createPostDto: CreatePostDto, @Req() req: { user: User }) {
    return this.postsService.create(createPostDto, req.user);
  }
  @Get()
  @ApiOkResponse({ type: [Post] })
  findAll() {
    return this.postsService.findAll();
  }

  @Get('users/:userId')
  @ApiOkResponse({ type: [Post] })
  findAllByUser(@Param('userId') userId: number) {
    return this.postsService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOkResponse({ type: Post })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access to resource' })
  findOne(@Param('id') id: number, @Req() req: { user: User }) {
    return this.postsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Post })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access to resource' })
  @ApiBadRequestResponse()
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: { user: User },
  ) {
    return this.postsService.update(+id, updatePostDto, req.user);
  }

  @Delete(':id')
  @ApiOkResponse({ status: 204 })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access to resource' })
  remove(@Param('id') id: string, @Req() req: { user: User }) {
    return this.postsService.remove(+id, req.user);
  }
}
