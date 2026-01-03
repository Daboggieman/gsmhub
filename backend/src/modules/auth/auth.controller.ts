import { Controller, Request, Post, UseGuards, Body, Get, Res } from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
    const { access_token, user } = await this.authService.login(loginDto);

    res.cookie('auth_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return { user };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('auth_token');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
