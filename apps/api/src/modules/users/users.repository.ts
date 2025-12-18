import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories';
import { PrismaService } from '../../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  role: true,
  createdAt: true,
} as const;

export type UserWithoutPassword = Omit<User, 'updatedAt'>;

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: { email: string; name?: string; role?: UserRole }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role ?? 'GUEST',
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: USER_SELECT,
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: { name?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
