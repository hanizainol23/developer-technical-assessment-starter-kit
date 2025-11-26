import { Body, Controller, Post, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.auth.register(dto.email, dto.password, dto.name);
    const { token } = await this.auth.login(user);
    
    res.cookie('authentication', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    return { id: user.id, email: user.email, message: 'Registration successful' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    const { token } = await this.auth.login(user);
    
    res.cookie('authentication', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    return { id: user.id, email: user.email, message: 'Login successful' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('authentication', { path: '/', httpOnly: true });
    return { message: 'Logout successful' };
  }
}
