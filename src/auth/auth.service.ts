import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(data: CreateUserDto) {
    try {
      const { password, ...userData } = data;

      const user = this.userRepo.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepo.save(user);

      return { ...user, token: this.getJwtToken({ id: user.id }) };
    } catch (error) {
      this.handlerDbErrors(error);
    }
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    const user = await this.userRepo.findOne({
      select: { id: true, email: true, password: true },
      where: { email },
    });

    if (!user) throw new UnauthorizedException('Check yours credentials');

    if (!bcrypt.compareSync(password, user.password))
      if (!user) throw new UnauthorizedException('Check yours credentials');

    return { ...user, token: this.getJwtToken({ id: user.id }) };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handlerDbErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);
    throw new InternalServerErrorException('Check server logs');
  }
}
