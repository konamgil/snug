'use server';

import { prisma, type User } from '@snug/database';

export async function getUserBySupabaseId(supabaseId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { supabaseId },
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(data: {
  email: string;
  supabaseId: string;
  firstName?: string;
  lastName?: string;
}): Promise<User> {
  return prisma.user.create({
    data: {
      email: data.email,
      supabaseId: data.supabaseId,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'GUEST',
    },
  });
}

export async function upsertUserFromAuth(data: {
  email: string;
  supabaseId: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}): Promise<User> {
  return prisma.user.upsert({
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
  });
}

export async function updateUser(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    countryCode?: string;
    avatarUrl?: string;
  }
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data,
  });
}
