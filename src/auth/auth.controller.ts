import { Controller, Post, UseGuards, Res } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { currentUser } from './current-user.decorator';
import { AuthService } from './auth.service';
import type { User } from '@prisma/client';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @currentUser() user: Omit<User, 'password'>,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }
}
