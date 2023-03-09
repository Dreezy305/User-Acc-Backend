import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  providers: [AuthService, JwtStrategy, PrismaService],
  controllers: [AuthController],
  imports: [JwtModule.register({})],
})
export class AuthModule {}
