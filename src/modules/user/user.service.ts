import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../prisma/generated/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly safeSelect = {
    id: true,
    email: true,
    username: true,
    phone: true,
    createdAt: true,
    updatedAt: true,
  } satisfies Prisma.UserSelect;

  private readonly authSelect = {
    ...this.safeSelect,
    password: true,
  } satisfies Prisma.UserSelect;

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: this.safeSelect,
    });
  }

  findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: this.safeSelect,
    });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
      select: this.safeSelect,
    });
  }

  findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: this.authSelect,
    });
  }

  findByPhoneWithPassword(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
      select: this.authSelect,
    });
  }

  createWithData(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data, select: this.safeSelect });
  }

  create(createUserDto: CreateUserDto) {
    const data: Prisma.UserCreateInput = {
      email: createUserDto.email,
      password: createUserDto.password,
      username: createUserDto.username,
      phone: createUserDto.phone ?? null,
    };

    return this.createWithData(data);
  }

  findAll() {
    return this.prisma.user.findMany({ select: this.safeSelect });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.safeSelect,
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const data: Prisma.UserUpdateInput = {
      ...(updateUserDto.email !== undefined
        ? { email: updateUserDto.email }
        : {}),
      ...(updateUserDto.password !== undefined
        ? { password: updateUserDto.password }
        : {}),
      ...(updateUserDto.username !== undefined
        ? { username: updateUserDto.username }
        : {}),
      ...(updateUserDto.phone !== undefined
        ? { phone: updateUserDto.phone }
        : {}),
    };

    return this.prisma.user.update({
      where: { id },
      data,
      select: this.safeSelect,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id }, select: this.safeSelect });
  }
}
