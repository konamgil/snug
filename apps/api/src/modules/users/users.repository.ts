import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories';
import { PrismaService } from '../../prisma/prisma.service';
import { User, UserRole, PurposeOfStay } from '@snug/database';
import { ProfileResponse } from './dto';

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
  preferredCurrency: true,
  preferredLanguage: true,
  createdAt: true,
} as const;

const USER_WITH_PROFILE_SELECT = {
  ...USER_SELECT,
  guestProfile: {
    select: {
      aboutMe: true,
      purposeOfStay: true,
      passportNumber: true,
      nationality: true,
    },
  },
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

  /**
   * 프로필 조회 (User + GuestProfile)
   */
  async findByIdWithProfile(id: string): Promise<ProfileResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_WITH_PROFILE_SELECT,
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      countryCode: user.countryCode,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      preferredCurrency: user.preferredCurrency,
      preferredLanguage: user.preferredLanguage,
      aboutMe: user.guestProfile?.aboutMe ?? null,
      purposeOfStay: user.guestProfile?.purposeOfStay ?? null,
      passportNumber: user.guestProfile?.passportNumber ?? null,
      nationality: user.guestProfile?.nationality ?? null,
    };
  }

  /**
   * Supabase ID로 프로필 조회
   */
  async findBySupabaseIdWithProfile(supabaseId: string): Promise<ProfileResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      select: USER_WITH_PROFILE_SELECT,
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      countryCode: user.countryCode,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      preferredCurrency: user.preferredCurrency,
      preferredLanguage: user.preferredLanguage,
      aboutMe: user.guestProfile?.aboutMe ?? null,
      purposeOfStay: user.guestProfile?.purposeOfStay ?? null,
      passportNumber: user.guestProfile?.passportNumber ?? null,
      nationality: user.guestProfile?.nationality ?? null,
    };
  }

  /**
   * 프로필 업데이트 (User + GuestProfile)
   */
  async updateWithProfile(
    id: string,
    data: {
      // User fields
      firstName?: string;
      lastName?: string;
      phone?: string;
      countryCode?: string;
      emailVerified?: boolean;
      avatarUrl?: string;
      preferredCurrency?: string;
      preferredLanguage?: string;
      // GuestProfile fields
      aboutMe?: string;
      purposeOfStay?: PurposeOfStay;
      passportNumber?: string;
      nationality?: string;
    },
  ): Promise<ProfileResponse> {
    // User 테이블 업데이트 데이터
    const userUpdateData: Record<string, unknown> = {};
    if (data.firstName !== undefined) userUpdateData.firstName = data.firstName;
    if (data.lastName !== undefined) userUpdateData.lastName = data.lastName;
    if (data.phone !== undefined) userUpdateData.phone = data.phone;
    if (data.countryCode !== undefined) userUpdateData.countryCode = data.countryCode;
    if (data.emailVerified !== undefined) userUpdateData.emailVerified = data.emailVerified;
    if (data.avatarUrl !== undefined) userUpdateData.avatarUrl = data.avatarUrl;
    if (data.preferredCurrency !== undefined)
      userUpdateData.preferredCurrency = data.preferredCurrency;
    if (data.preferredLanguage !== undefined)
      userUpdateData.preferredLanguage = data.preferredLanguage;

    // GuestProfile 테이블 업데이트 데이터
    const guestProfileData: Record<string, unknown> = {};
    if (data.aboutMe !== undefined) guestProfileData.aboutMe = data.aboutMe;
    if (data.purposeOfStay !== undefined) guestProfileData.purposeOfStay = data.purposeOfStay;
    if (data.passportNumber !== undefined) guestProfileData.passportNumber = data.passportNumber;
    if (data.nationality !== undefined) guestProfileData.nationality = data.nationality;

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...userUpdateData,
        guestProfile:
          Object.keys(guestProfileData).length > 0
            ? {
                upsert: {
                  create: guestProfileData,
                  update: guestProfileData,
                },
              }
            : undefined,
      },
      select: USER_WITH_PROFILE_SELECT,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      countryCode: user.countryCode,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      preferredCurrency: user.preferredCurrency,
      preferredLanguage: user.preferredLanguage,
      aboutMe: user.guestProfile?.aboutMe ?? null,
      purposeOfStay: user.guestProfile?.purposeOfStay ?? null,
      passportNumber: user.guestProfile?.passportNumber ?? null,
      nationality: user.guestProfile?.nationality ?? null,
    };
  }

  /**
   * 사용자 Upsert (OAuth 로그인 시 사용)
   */
  async upsertFromAuth(data: {
    email: string;
    supabaseId: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }) {
    return this.prisma.user.upsert({
      where: { supabaseId: data.supabaseId },
      update: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
      },
      create: {
        email: data.email,
        supabaseId: data.supabaseId,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
        role: 'GUEST',
      },
      select: USER_SELECT,
    });
  }
}
