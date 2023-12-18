import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(data: CreateUserDto) {
    try {
      const { password, ...userData } = data;

      const user = this.userRepo.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepo.save(user);

      return user;
    } catch (error) {
      this.handlerDbErrors(error);
    }
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    const user = await this.userRepo.findOne({
      select: { email: true, password: true },
      where: { email },
    });

    return user;
  }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }

  private handlerDbErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);
    throw new InternalServerErrorException('Check server logs');
  }
}
