import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @Exclude()
  @Column()
  @IsString()
  @IsNotEmpty()
  password: string;
}
