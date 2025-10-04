import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities/user.entity';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) { }
  
  async create(createUserDto: CreateUserDto) {
    const { username } = createUserDto;
    const user = await this.userRepository.findOne({ where: { username } });
    if (user) {
      throw new ConflictException({ message: 'User already exists' });
    }
    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }

  async findAll() {
    const users = await this.userRepository.find();
    return users;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { username } = updateUserDto;
    if (username) {
      const CheckUsername = await this.userRepository.findOne({ where: { username } });
      if (CheckUsername && CheckUsername.id !== id) {
        throw new ConflictException({ message: 'Username already exists' });
      }
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    const updateUser = await this.userRepository.update(id, updateUserDto);
    return { message: 'User updated successfully', updateUser };
  }
  
  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    await this.userRepository.remove(user);
    return { message: 'User removed successfully' };
  }
}
