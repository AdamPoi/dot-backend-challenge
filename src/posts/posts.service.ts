import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DataSource } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PostsService {
  private postsRepository;
  constructor(private dataSource: DataSource) {
    this.postsRepository = this.dataSource.getRepository(Post);
  }

  async create(dto: CreatePostDto, currentUser: User) {
    let post = await this.postsRepository.save({
      ...dto,
      user: currentUser,
    });
    delete post.user;
    return post;
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find();
  }

  async findAllByUser(userId: Number): Promise<Post[]> {
    return this.postsRepository.find({
      where: {
        user: { id: userId },
      },
    });
  }

  async findOne(id: number, currentUser: User): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id, user: { id: currentUser.id } },
      loadRelationIds: true,
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.user != currentUser.id)
      throw new UnauthorizedException('Unauthorized access to resource');
    return post;
  }

  async update(
    id: number,
    dto: UpdatePostDto,
    currentUser: User,
  ): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id, user: { id: currentUser.id } },
      loadRelationIds: true,
    });
    if (!post) throw new NotFoundException('Post not found');

    if (post.user != currentUser.id)
      throw new UnauthorizedException('Unauthorized access to resource');

    Object.assign(post, {
      ...dto,
    });
    await this.postsRepository.save(post);
    return post;
  }

  async remove(id: number, currentUser: User): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id, user: { id: currentUser.id } },
      loadRelationIds: true,
    });
    if (!post) throw new NotFoundException('Post not found');

    if (post.user != currentUser.id)
      throw new UnauthorizedException('Unauthorized access to resource');

    await this.postsRepository.delete(id);
    throw new HttpException('Post deleted successfully', HttpStatus.NO_CONTENT);
  }
}
