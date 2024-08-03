import {
  HttpException,
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  private usersRepository;
  constructor(private dataSource: DataSource) {
    this.usersRepository = this.dataSource.getRepository(User);
  }
  async create(dto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { username: dto.username },
    });
    if (existingUser) {
      throw new NotAcceptableException('Username already exists');
    }
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.usersRepository
      .save({
        ...dto,
        password: hashedPassword,
      })
      .then((user) => {
        const { password, ...result } = user;
        return result;
      });
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOneByField(
    fieldValue: number | string,
    fieldName: string = 'id',
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { [fieldName]: fieldValue },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(
    id: number,
    dto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    if (currentUser.id != id)
      throw new UnauthorizedException('You can only update your account');
    if (typeof dto.username != 'undefined') {
      const existingUser = await this.usersRepository.findOne({
        where: { username: dto.username },
      });

      if (existingUser && existingUser.username !== dto.username) {
        throw new UnauthorizedException('Username already exists');
      }
    }

    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    if (dto.password) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      dto.password = hashedPassword;
    }
    Object.assign(user, { ...dto });
    await this.usersRepository.save(user);
    return user;
  }

  async remove(id: number, currentUser: User): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    if (currentUser.id !== user.id)
      throw new UnauthorizedException('You can only delete your account');
    await this.usersRepository.delete(id);
    throw new HttpException('User deleted successfully', HttpStatus.NO_CONTENT);
  }
}
