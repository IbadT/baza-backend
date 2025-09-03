import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'a@a.com',
    required: true,
  })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: '1234567',
    required: true,
  })
  @Expose()
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  readonly password: string;
}