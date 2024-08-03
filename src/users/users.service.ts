import {
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

    return this.usersRepository.save({ ...dto, password: hashedPassword });
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy(id);
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

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    if (typeof dto.username != 'undefined') {
      const existingUser = await this.usersRepository.findOne({
        where: { username: dto.username },
      });

      if (existingUser.username !== dto.username) {
        throw new UnauthorizedException('Username already exists');
      }
    }

    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, { ...dto });
    console.log(user);
    await this.usersRepository.save(user);
    return user;
  }

  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    await this.usersRepository.delete(id);
    return user;
  }
}
