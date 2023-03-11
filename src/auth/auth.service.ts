import { ForbiddenException, Injectable, ParseIntPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from './dto/auth.dto';
import { TransferDto } from './dto/transfer.dto';

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
      const paymentID = function generateId() {
        const length = 7;
        const string_value = uuid();
        const cleaned_string = string_value.replace(/[^a-zA-Z0-9\n\.]/g, '');
        const chars = cleaned_string;
        let result = '';
        for (let i = 0; i < length; i++) {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
      };
      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          phone_number: dto.phoneNumber,
          password: hash,
          paymentID: [paymentID()],
          accountBalance: 5000,
          currency: '₦',
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

  // GENERATES D ADDITIONAL PAYMENT ID
  async generatePaymentId(userId: string) {
    await this.prisma.$connect();
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User does not exist');
    }

    if (user.paymentID.length === 5) {
      throw new ForbiddenException('Max number of payment IDs reached');
    }

    const paymentID = function generateId() {
      const length = 7;
      const string_value = uuid();
      const cleaned_string = string_value.replace(/[^a-zA-Z0-9\n\.]/g, '');
      const chars = cleaned_string;
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    };

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          paymentID: [...user.paymentID, paymentID()],
        },
      });
      return {
        data: updatedUser,
        success: true,
        message: 'payment ID generated successfully',
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

  // DELETE PAYMENT ID
  async deletePaymentId(userId: string, paymentId: string) {
    await this.prisma.$connect();
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      throw new ForbiddenException('User does not exist');
    }
    const index = user.paymentID.indexOf(paymentId);
    if (index === -1) {
      throw new ForbiddenException(
        `Payment ${paymentId} not found for user ${userId}`,
      );
    }
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          paymentID: { set: user.paymentID.filter((id) => id !== paymentId) },
        },
      });
      return {
        data: updatedUser,
        success: true,
        message: 'payment ID deleted successfully',
      };
    } catch (error) {}
  }

  // FIND USER BY THEIR PAYMENT ID
  async getUserByPaymentId(paymentId: string) {
    await this.prisma.$connect();
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          paymentID: {
            has: paymentId,
          },
        },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      return {
        data: user,
        success: true,
        message: 'user data successfully retrieved',
      };
    } catch (error) {
      throw new ForbiddenException('User not found');
    }
  }

  // SEND AND RECIEVE MONEY
  async transferFunds(transferDto: TransferDto) {
    await this.prisma.$connect();
    const sender = await this.prisma.user.findUnique({
      where: { email: transferDto.senderEmail },
      // select: { id: true, accountBalance: true, currency: true },
      include: { sentTransactions: true },
    });

    if (!sender) {
      return { message: 'Sender not found' };
    }

    const recipient = await this.prisma.user.findUnique({
      where: { email: transferDto.receiverEmail },
      // select: { id: true, accountBalance: true, currency: true },
      include: { receivedTransactions: true },
    });

    if (!recipient) {
      return { message: 'Recipient not found' };
    }

    if (sender.accountBalance < transferDto.amount) {
      return { message: 'Insufficient funds' };
    }

    const newTransaction = await this.prisma.transaction.create({
      data: {
        // senderEmail: transferDto.senderEmail,
        // receiverEmail: transferDto.receiverEmail,
        amount: transferDto.amount,
        currency: '₦',
        transactionID: uuid(),
        senderID: { connect: { id: sender.id } },
        receiverID: { connect: { id: recipient.id } },
      } as Prisma.TransactionCreateInput,
    });

    try {
      const updatedTransaction = await this.prisma.$transaction(async (tx) => {
        const sender = await tx.user.update({
          data: {
            accountBalance: {
              decrement: transferDto.amount,
            },
            // sentTransactions: [...[newTransaction]],
          },
          where: {
            email: transferDto.senderEmail,
          },
          select: {
            accountBalance: true,
            currency: true,
            sentTransactions: true,
          },
        });
        const reciever = await tx.user.update({
          data: {
            accountBalance: {
              increment: transferDto.amount,
            },
            // receivedTransactions: { set: { id: newTransaction.id } },
          },
          where: {
            email: transferDto.receiverEmail,
          },
          select: {
            accountBalance: true,
            currency: true,
            receivedTransactions: true,
          },
        });
        return {
          data: { sender: sender, recipient: reciever },
          success: true,
          message: 'funds sent successfully',
        };
      });
      return { updatedTransaction, transactionDetails: newTransaction };
    } catch (error) {
      console.log(error);
      const reversedTransaction = await this.prisma.$transaction(async (tx) => {
        const updatedSender = await tx.user.update({
          data: {
            accountBalance: {
              increment: transferDto.amount,
            },
          },
          where: {
            id: sender.id,
          },
          select: { accountBalance: true },
        });

        const updatedRecipient = await tx.user.update({
          data: {
            accountBalance: {
              decrement: transferDto.amount,
            },
          },
          where: {
            id: recipient.id,
          },
          select: { accountBalance: true },
        });

        return {
          data: { sender: updatedSender, recipient: updatedRecipient },
          success: false,
          message: 'transaction failed',
        };
      });

      return reversedTransaction;
    }
  }
}
