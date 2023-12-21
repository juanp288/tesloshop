import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { Auth } from './decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() data: CreateUserDto) {
    return this.authService.create(data);
  }

  @Post('login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @ApiBearerAuth()
  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @Auth(ValidRoles.admin)
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      mesagge: 'Private Hello',
      user,
      userEmail,
      requestInfo: { headers: rawHeaders },
    };
  }
}
