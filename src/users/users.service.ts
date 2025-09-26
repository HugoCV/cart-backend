import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserRequest } from './dto/create-user.request';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    data: CreateUserRequest,
  ): Promise<Omit<User, 'password' | 'createdAt' | 'updatedAt'> | undefined> {
    try {
      return await this.prismaService.user.create({
        data: {
          ...data,
          password: await bcrypt.hash(data.password, 10),
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new UnprocessableEntityException('Email already exists');
      }
      console.error(e);
    }
  }
}
