import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsEmail, IsInt, IsNotEmpty, Matches } from 'class-validator';

export class TransferDto {
  @ApiProperty({
    description: 'user email',
    type: String,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @Matches(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    { message: 'email must be a valid email' },
  )
  senderEmail: string;

  @ApiProperty({
    description: 'user email',
    type: String,
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @Matches(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    { message: 'email must be a valid email' },
  )
  receiverEmail: string;

  @ApiProperty({
    description: 'sending amount',
    type: String,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  amount: number;
}
