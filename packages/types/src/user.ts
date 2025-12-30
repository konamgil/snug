// User Types - Prisma 스키마와 동기화

export type UserRole = 'GUEST' | 'HOST' | 'CO_HOST' | 'SNUG_OPERATOR' | 'PARTNER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  countryCode: string | null;
  emailVerified: boolean;
  avatarUrl: string | null;
  supabaseId: string | null;
  // 사용자 설정
  preferredCurrency: string;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'avatarUrl' | 'role'
> {
  fullName: string | null;
}

export interface CreateUserInput {
  email: string;
  supabaseId: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  countryCode?: string;
  avatarUrl?: string;
  preferredCurrency?: string;
  preferredLanguage?: string;
}
