import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/auth.dto';

@Controller('auth')
@ApiTags('User Management Service')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: 'Create User' })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post('signup')
  async signUp(@Body() dto: CreateUserDto) {
    return await this.authService.signUp(dto);
  }

  @ApiOperation({ summary: 'generate payment id' })
  @ApiOkResponse({
    status: HttpStatus.FOUND,
    description: 'Payment ID generated successfully.',
  })
  @Put('/generatePaymentId/:id')
  async generateId(@Param('id') id: string) {
    return this.authService.generatePaymentId(id);
  }
}
