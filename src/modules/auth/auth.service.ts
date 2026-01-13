import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

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
      const code = this.getErrorCode(err);
      if (code === 'P2002') {
        throw new ConflictException('邮箱/用户名/手机号已存在');
      }
      throw err;
    }
  }

  private getErrorCode(err: unknown): string | undefined {
    if (typeof err !== 'object' || err === null) return undefined;
    if (!('code' in err)) return undefined;
    const code = (err as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }

  async login(loginDto: LoginDto) {
    const account = loginDto.account.trim();

    const isEmail = account.includes('@');
    const user = isEmail
      ? await this.userService.findByEmailWithPassword(account)
      : await this.userService.findByPhoneWithPassword(account);

    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const passwordOk = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordOk) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    return { token };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    void updateAuthDto;
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
