import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RegisterDto } from '../auth/dto';
import { UpdateUserDto, ProfileResponse } from './dto';
import { PurposeOfStay } from '@snug/database';

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

  /**
   * 프로필 조회 (User + GuestProfile)
   */
  async getProfile(id: string): Promise<ProfileResponse> {
    const profile = await this.usersRepository.findByIdWithProfile(id);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return profile;
  }

  /**
   * Supabase ID로 프로필 조회
   */
  async getProfileBySupabaseId(supabaseId: string): Promise<ProfileResponse> {
    const profile = await this.usersRepository.findBySupabaseIdWithProfile(supabaseId);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return profile;
  }

  /**
   * 프로필 업데이트 (User + GuestProfile)
   */
  async updateProfile(id: string, data: UpdateUserDto): Promise<ProfileResponse> {
    await this.findOne(id); // 존재 여부 확인
    return this.usersRepository.updateWithProfile(id, {
      ...data,
      purposeOfStay: data.purposeOfStay as PurposeOfStay | undefined,
    });
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

  /**
   * OAuth 로그인 시 사용자 Upsert
   */
  async upsertFromAuth(data: {
    email: string;
    supabaseId: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }) {
    return this.usersRepository.upsertFromAuth(data);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.usersRepository.delete(id);
  }
}
