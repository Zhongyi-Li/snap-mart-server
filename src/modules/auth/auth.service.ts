import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async create(registerDto: RegisterDto) {
    const { email, password, username, phone } = registerDto;

    const [emailExists, usernameExists] = await Promise.all([
      this.userService.findByEmail(email),
      this.userService.findByUsername(username),
    ]);

    if (emailExists) {
      throw new ConflictException('邮箱已被注册');
    }

    if (usernameExists) {
      throw new ConflictException('用户名已被占用');
    }

    if (phone) {
      const phoneExists = await this.userService.findByPhone(phone);
      if (phoneExists) {
        throw new ConflictException('手机号已被注册');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      return await this.userService.createWithData({
        email,
        username,
        password: hashedPassword,
        phone: phone ?? null,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ConflictException('邮箱/用户名/手机号已存在');
        }
      }
      throw err;
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
