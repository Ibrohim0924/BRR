import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) { }
  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;
    const user = await this.userRepository.findOne({ where: { email } });
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

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { email } = updateUserDto;
    const CheckEmail = await this.userRepository.findOne({ where: { email } });
    if (CheckEmail) {
      throw new ConflictException({ message: 'Email already exists' });
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    const updateUser = await this.userRepository.update(id, updateUserDto);
    return { message: 'User updated successfully', updateUser };

  }
  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }
    await this.userRepository.remove(user);
    return { message: 'User removed successfully' };
  }
}
