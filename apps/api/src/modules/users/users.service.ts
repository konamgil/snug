import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RegisterDto } from '../auth/dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(data: RegisterDto & { emailVerified?: boolean; supabaseId?: string }) {
    const existingUser = await this.usersRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    return this.usersRepository.create({
      email: data.email,
      emailVerified: data.emailVerified ?? false,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      countryCode: data.countryCode ?? '+82',
      role: data.role ?? 'GUEST',
      supabaseId: data.supabaseId,
    });
  }

  async findAll() {
    return this.usersRepository.findAll();
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async findBySupabaseId(supabaseId: string) {
    return this.usersRepository.findBySupabaseId(supabaseId);
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      preferredCurrency?: string;
      preferredLanguage?: string;
    },
  ) {
    await this.findOne(id);
    return this.usersRepository.update(id, data);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.usersRepository.delete(id);
  }
}
