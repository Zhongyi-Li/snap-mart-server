import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '邮箱不能为空或格式不正确' })
  email: string;

  @IsString({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于 6 位' })
  password: string;
}
