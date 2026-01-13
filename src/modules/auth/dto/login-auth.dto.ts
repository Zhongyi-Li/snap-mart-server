import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString({ message: '账号不能为空' })
  account: string;

  @IsString({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于 6 位' })
  password: string;
}
