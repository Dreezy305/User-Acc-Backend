import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'user mail',
    type: String,
    required: true,
  })
  email: string;
}
