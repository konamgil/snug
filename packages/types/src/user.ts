// User Types

export type UserRole = 'GUEST' | 'HOST' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string | null;
  nameKo: string | null;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  language: string;
  nationality: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends Pick<User, 'id' | 'name' | 'avatar' | 'role' | 'verified'> {
  reviewCount?: number;
  averageRating?: number;
}

export interface CreateUserInput {
  email: string;
  name?: string;
  role?: UserRole;
  language?: string;
  nationality?: string;
}

export interface UpdateUserInput {
  name?: string;
  nameKo?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  language?: string;
  nationality?: string;
}
