import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories';
import { PrismaService } from '../../prisma/prisma.service';
import { User, UserRole } from '@snug/database';

const USER_SELECT = {
  id: true,
  email: true,
  emailVerified: true,
  firstName: true,
  lastName: true,
  phone: true,
  countryCode: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
} as const;

export type UserWithoutPassword = Omit<User, 'updatedAt'>;

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: {
    email: string;
    emailVerified?: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
    countryCode?: string;
    role?: UserRole;
    supabaseId?: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        emailVerified: data.emailVerified ?? false,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        countryCode: data.countryCode ?? '+82',
        role: data.role ?? 'GUEST',
        supabaseId: data.supabaseId,
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

  async findBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseId },
    });
  }

  async update(id: string, data: { firstName?: string; lastName?: string; avatarUrl?: string }) {
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
