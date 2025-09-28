import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import ms from 'ms';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async verifyUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.getUser({ email });
      const isAuthenticated = await bcrypt.compare(password, user.password);
      if (!isAuthenticated) {
        throw new UnauthorizedException('Invalid credentials');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    } catch (err) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  login(user: Omit<User, 'password'>, response: Response) {
    const tokenPayload: TokenPayload = {
      userId: user.id,
    };

    const expiresIn = this.configService.getOrThrow<string>('JWT_EXPIRATION');
    const expires = new Date();
    const expirationMilliseconds = ms(expiresIn as any);

    if (typeof expirationMilliseconds !== 'number') {
      // Esto previene errores si JWT_EXPIRATION es inválido
      throw new Error('Invalid JWT_EXPIRATION format in .env file');
    }

    expires.setTime(expires.getTime() + expirationMilliseconds);

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      httpOnly: true,
      secure: true,
      expires,
    });

    return { tokenPayload };
  }
}
