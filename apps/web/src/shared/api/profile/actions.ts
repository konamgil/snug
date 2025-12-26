'use server';

import { prisma, type PurposeOfStay } from '@snug/database';

export interface ProfileData {
  // User 테이블
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  countryCode: string | null;
  phoneVerified: boolean;
  avatarUrl: string | null;
  // GuestProfile 테이블
  aboutMe: string | null;
  purposeOfStay: PurposeOfStay | null;
  passportNumber: string | null;
  nationality: string | null;
}

export async function getProfile(userId: string): Promise<ProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      guestProfile: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    countryCode: user.countryCode,
    phoneVerified: user.phoneVerified,
    avatarUrl: user.avatarUrl,
    aboutMe: user.guestProfile?.aboutMe ?? null,
    purposeOfStay: user.guestProfile?.purposeOfStay ?? null,
    passportNumber: user.guestProfile?.passportNumber ?? null,
    nationality: user.guestProfile?.nationality ?? null,
  };
}

export async function getProfileBySupabaseId(supabaseId: string): Promise<ProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { supabaseId },
    include: {
      guestProfile: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    countryCode: user.countryCode,
    phoneVerified: user.phoneVerified,
    avatarUrl: user.avatarUrl,
    aboutMe: user.guestProfile?.aboutMe ?? null,
    purposeOfStay: user.guestProfile?.purposeOfStay ?? null,
    passportNumber: user.guestProfile?.passportNumber ?? null,
    nationality: user.guestProfile?.nationality ?? null,
  };
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  countryCode?: string;
  phoneVerified?: boolean;
  avatarUrl?: string;
  // GuestProfile
  aboutMe?: string;
  purposeOfStay?: PurposeOfStay;
  passportNumber?: string;
  nationality?: string;
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileInput,
): Promise<ProfileData | null> {
  // User 테이블 업데이트
  const userUpdateData: Record<string, unknown> = {};
  if (data.firstName !== undefined) userUpdateData.firstName = data.firstName;
  if (data.lastName !== undefined) userUpdateData.lastName = data.lastName;
  if (data.phone !== undefined) userUpdateData.phone = data.phone;
  if (data.countryCode !== undefined) userUpdateData.countryCode = data.countryCode;
  if (data.phoneVerified !== undefined) userUpdateData.phoneVerified = data.phoneVerified;
  if (data.avatarUrl !== undefined) userUpdateData.avatarUrl = data.avatarUrl;

  // GuestProfile 테이블 업데이트
  const guestProfileData: Record<string, unknown> = {};
  if (data.aboutMe !== undefined) guestProfileData.aboutMe = data.aboutMe;
  if (data.purposeOfStay !== undefined) guestProfileData.purposeOfStay = data.purposeOfStay;
  if (data.passportNumber !== undefined) guestProfileData.passportNumber = data.passportNumber;
  if (data.nationality !== undefined) guestProfileData.nationality = data.nationality;

  // 트랜잭션으로 업데이트
  const user = await prisma.user.update({
    where: { id: userId },
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
    include: {
      guestProfile: true,
    },
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    countryCode: user.countryCode,
    phoneVerified: user.phoneVerified,
    avatarUrl: user.avatarUrl,
    aboutMe: user.guestProfile?.aboutMe ?? null,
    purposeOfStay: user.guestProfile?.purposeOfStay ?? null,
    passportNumber: user.guestProfile?.passportNumber ?? null,
    nationality: user.guestProfile?.nationality ?? null,
  };
}
