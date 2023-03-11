import {
  Body,
  Controller,
  Delete,
  Get,
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
import { TransferDto } from './dto/transfer.dto';

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

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'generate payment id' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Payment ID generated successfully.',
  })
  @Put('/generatePaymentId/:id')
  async generateId(@Param('id') id: string) {
    return this.authService.generatePaymentId(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'delete user with payment id' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Payment ID deleted successfully.',
  })
  @Delete('/deletePaymentId/:id/paymentId/:paymentId')
  async deletePaymentId(
    @Param('id') id: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.authService.deletePaymentId(id, paymentId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get user by payment id' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'User info retrieved successfully.',
  })
  @Get('/getUserByPaymentId/:paymentId')
  async getUserByPaymentId(@Param('paymentId') paymentId: string) {
    return this.authService.getUserByPaymentId(paymentId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'transfer funds' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Funds sent successfully.',
  })
  @Post('/transferFunds')
  async transferFunds(@Body() transferdto: TransferDto) {
    return this.authService.transferFunds(transferdto);
  }
}
