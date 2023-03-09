import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(dto: CreateUserDto) {
    await this.prisma.$connect();
    const hash = await argon.hash(dto.password);
    const checkIfUserExist = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (checkIfUserExist) {
      throw new ForbiddenException('User with these credentials already exist');
    }

    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          phone_number: dto.phoneNumber,
          password: hash,
        },
      });
      return {
        data: newUser,
        success: true,
        message: 'user created successfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ForbiddenException(
          'User with these credentials already exist',
        );
      } else if (error instanceof PrismaClientValidationError) {
        throw new ForbiddenException('Invalid credentials');
      } else {
        throw error;
      }
    }
  }
}
