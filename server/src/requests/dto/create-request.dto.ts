import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @MinLength(10, { message: 'Message must be at least 10 characters' })
  message: string;
}