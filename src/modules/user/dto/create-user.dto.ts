import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsString()
  @MinLength(6, { message: '密码长度不能少于 6 位' })
  password: string;

  @IsString()
  username: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
