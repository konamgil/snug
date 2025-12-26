# Snug 프로젝트 아키텍처 문서

> **목적**: 이 문서는 AI 및 개발자가 Snug 프로젝트의 아키텍처를 이해하고 일관된 구현을 할 수 있도록 작성되었습니다.

## 목차

1. [시스템 아키텍처 개요](#1-시스템-아키텍처-개요)
2. [역할 분담](#2-역할-분담)
3. [인증 시스템](#3-인증-시스템)
4. [API 통신 패턴](#4-api-통신-패턴)
5. [타입 공유 전략](#5-타입-공유-전략)
6. [실시간 통신](#6-실시간-통신)
7. [SEO 전략](#7-seo-전략)
8. [디렉토리 구조](#8-디렉토리-구조)
9. [구현 가이드](#9-구현-가이드)

---

## 1. 시스템 아키텍처 개요

```
┌─────────────────┐     ┌─────────────────┐
│   모바일 앱      │     │   웹 브라우저     │
│  (Capacitor)    │     │                 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │ REST API              │ REST API (SSR)
         │ + WebSocket           │ + WebSocket (채팅)
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────────────────┐
│                 │◄────│      Next.js (BFF)           │
│    NestJS API   │     │  • SSR/SSG (SEO)            │
│  (Single SSOT)  │     │  • Server Actions → API 호출 │
│                 │     │  • DB 직접접근 ❌             │
│  • 비즈니스 로직  │     │  • 권한판단 ❌               │
│  • 권한 판단     │     └─────────────────────────────┘
│  • DB 접근      │
│  • 실시간 소켓   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Supabase)    │
└─────────────────┘
```

### 핵심 원칙

1. **NestJS = Single Source of Truth (SSOT)**
   - 모든 비즈니스 로직은 NestJS에서만 처리
   - 모든 권한 판단은 NestJS에서만 수행
   - 모든 DB 접근은 NestJS를 통해서만 수행

2. **Next.js = BFF (Backend For Frontend) + SEO**
   - Server Actions는 NestJS API를 호출하는 프록시 역할만 수행
   - SSR/SSG를 통한 SEO 최적화
   - DB 직접 접근 금지, 권한 판단 금지

3. **Capacitor 앱 = NestJS 직접 통신**
   - REST API: NestJS 직접 호출
   - WebSocket: NestJS Socket.io 직접 연결

---

## 2. 역할 분담

| 구분 | NestJS | Next.js |
|------|--------|---------|
| **비즈니스 로직** | ✅ 전담 | ❌ 금지 |
| **권한/인증** | ✅ JWT 검증 | 토큰 전달만 |
| **DB 접근** | ✅ Prisma | ❌ 금지 |
| **SEO** | ❌ | ✅ SSR/SSG |
| **실시간 통신** | ✅ WebSocket | 클라이언트 연결 |
| **폼 검증** | class-validator | zod (UX용) |

### Next.js에서 절대 하지 말아야 할 것

```typescript
// ❌ 잘못된 예: Server Action에서 Prisma 직접 사용
'use server';
import { prisma } from '@snug/database';

export async function getAccommodations(hostId: string) {
  return prisma.accommodation.findMany({ where: { hostId } }); // ❌ 금지!
}

// ✅ 올바른 예: NestJS API 호출
'use server';
import { apiClient } from '@/shared/api/client';

export async function getAccommodations() {
  return apiClient.get<Accommodation[]>('/accommodations');
}
```

---

## 3. 인증 시스템

### 3.1 인증 플로우

```
[로그인 플로우]
1. 사용자 → Supabase Auth (Google/Kakao/Email)
2. Supabase → JWT 토큰 발급 → 브라우저 쿠키에 저장
3. Server Action 호출 시:
   - cookies()에서 토큰 읽기
   - Authorization 헤더에 추가하여 NestJS 호출
4. NestJS:
   - Authorization 헤더에서 토큰 추출
   - Supabase JWT Secret으로 검증
   - payload.sub → DB User 조회 → req.user 설정
```

### 3.2 핵심 설계: Authorization Header 통일

**NestJS는 Authorization Header만 확인합니다** (쿠키 파싱 불필요)

```
웹 (Server Actions): cookies()에서 토큰 읽기 → Authorization 헤더로 전달
앱 (Capacitor):      SecureStorage에서 토큰 읽기 → Authorization 헤더로 전달
```

### 3.3 NestJS Supabase JWT Strategy

```typescript
// apps/api/src/modules/auth/strategies/supabase-jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@/prisma/prisma.service';

interface SupabaseJwtPayload {
  sub: string;        // Supabase User ID
  email?: string;
  aud: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class SupabaseJwtStrategy extends PassportStrategy(Strategy, 'supabase-jwt') {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 헤더만 확인 (단순)
      secretOrKey: configService.get('SUPABASE_JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: SupabaseJwtPayload) {
    // Supabase ID로 우리 DB의 User 조회
    const user = await this.prisma.user.findUnique({
      where: { supabaseId: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found in database');
    }

    return user; // req.user에 설정됨
  }
}
```

### 3.4 환경 변수

```env
# Supabase Dashboard > Settings > API > JWT Secret
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"
NEST_API_URL="http://localhost:4000"
```

---

## 4. API 통신 패턴

### 4.1 Next.js API 클라이언트

```typescript
// apps/web/src/shared/api/client.ts
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEST_API_URL || 'http://localhost:4000';

interface ApiClientOptions {
  cache?: RequestCache;
  tags?: string[];
}

export const apiClient = {
  /**
   * GET 요청
   * 쿠키에서 토큰을 읽어 Authorization 헤더로 전달
   */
  get: async <T>(url: string, options?: ApiClientOptions): Promise<T> => {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers,
      cache: options?.cache ?? 'no-store',
      next: options?.tags ? { tags: options.tags } : undefined,
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  },

  /**
   * POST 요청
   */
  post: async <T>(url: string, data: unknown, options?: ApiClientOptions): Promise<T> => {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      cache: options?.cache ?? 'no-store',
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  },

  /**
   * PATCH 요청
   */
  patch: async <T>(url: string, data: unknown): Promise<T> => {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  },

  /**
   * DELETE 요청
   */
  delete: async <T>(url: string): Promise<T> => {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<T>;
  },
};
```

### 4.2 Server Action 패턴

```typescript
// apps/web/src/shared/api/accommodation/actions.ts
'use server';

import { apiClient } from '@/shared/api/client';
import type { Accommodation, CreateAccommodationDto } from '@snug/types';

/**
 * 숙소 목록 조회
 * - 인증된 사용자의 숙소 목록을 반환
 * - 권한 판단은 NestJS에서 수행
 */
export async function getAccommodations(): Promise<Accommodation[]> {
  return apiClient.get<Accommodation[]>('/accommodations');
}

/**
 * 숙소 상세 조회
 */
export async function getAccommodation(id: string): Promise<Accommodation | null> {
  return apiClient.get<Accommodation | null>(`/accommodations/${id}`);
}

/**
 * 숙소 생성
 * - GUEST → HOST 역할 업그레이드는 NestJS에서 처리
 */
export async function createAccommodation(
  data: CreateAccommodationDto
): Promise<{ accommodation: Accommodation; roleUpgraded: boolean }> {
  return apiClient.post('/accommodations', data);
}

/**
 * 숙소 수정
 */
export async function updateAccommodation(
  id: string,
  data: Partial<CreateAccommodationDto>
): Promise<Accommodation> {
  return apiClient.patch(`/accommodations/${id}`, data);
}

/**
 * 숙소 삭제
 */
export async function deleteAccommodation(id: string): Promise<void> {
  return apiClient.delete(`/accommodations/${id}`);
}
```

---

## 5. 타입 공유 전략

### 5.1 핵심 원칙

```
문제: class-validator 데코레이터가 프론트엔드 번들에 포함되면 에러 발생

해결책:
- packages/types: 순수 interface/type만 (공유)
- NestJS: class-validator 데코레이터 (DTO 클래스)
- Next.js: zod 스키마 (폼 검증)
```

### 5.2 구현 예시

```typescript
// packages/types/src/accommodation.ts (순수 타입만 - 공유)
export interface Accommodation {
  id: string;
  hostId: string;
  groupId?: string | null;
  roomName: string;
  accommodationType: 'HOUSE' | 'SHARE_ROOM' | 'SHARE_HOUSE' | 'APARTMENT';
  buildingType?: 'APARTMENT' | 'VILLA' | 'HOUSE' | 'OFFICETEL' | null;
  usageTypes: ('STAY' | 'SHORT_TERM')[];
  address: string;
  basePrice: number;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
  // ... 기타 필드
}

export interface CreateAccommodationDto {
  roomName: string;
  accommodationType: 'HOUSE' | 'SHARE_ROOM' | 'SHARE_HOUSE' | 'APARTMENT';
  usageTypes: ('STAY' | 'SHORT_TERM')[];
  address: string;
  basePrice: number;
  // ... 기타 필드
}
```

```typescript
// apps/api/src/modules/accommodations/dto/create-accommodation.dto.ts (NestJS용)
import { IsString, IsNumber, IsArray, IsEnum, IsOptional } from 'class-validator';

export class CreateAccommodationDto {
  @IsString()
  roomName: string;

  @IsEnum(['HOUSE', 'SHARE_ROOM', 'SHARE_HOUSE', 'APARTMENT'])
  accommodationType: string;

  @IsArray()
  @IsEnum(['STAY', 'SHORT_TERM'], { each: true })
  usageTypes: string[];

  @IsString()
  address: string;

  @IsNumber()
  basePrice: number;

  // ... 기타 필드
}
```

```typescript
// apps/web/src/schemas/accommodation.ts (Next.js용 - zod)
import { z } from 'zod';

export const accommodationSchema = z.object({
  roomName: z.string().min(1, '방 이름을 입력해주세요'),
  accommodationType: z.enum(['HOUSE', 'SHARE_ROOM', 'SHARE_HOUSE', 'APARTMENT']),
  usageTypes: z.array(z.enum(['STAY', 'SHORT_TERM'])).min(1),
  address: z.string().min(1, '주소를 입력해주세요'),
  basePrice: z.number().min(0, '가격은 0 이상이어야 합니다'),
  // ... 기타 필드
});

export type AccommodationFormData = z.infer<typeof accommodationSchema>;
```

---

## 6. 실시간 통신

### 6.1 채팅 아키텍처

```
❌ 잘못된 방식: Browser → Next.js Server → NestJS Socket (불필요한 부하)
✅ 올바른 방식: Browser → NestJS Socket 직접 연결
```

### 6.2 클라이언트 구현

```typescript
// apps/web/src/features/chat/hooks/useChat.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/shared/stores';

const NESTJS_SOCKET_URL = process.env.NEXT_PUBLIC_NESTJS_SOCKET_URL || 'http://localhost:4000';

export function useChat(roomId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    // NestJS Socket.io에 직접 연결
    const newSocket = io(NESTJS_SOCKET_URL, {
      auth: {
        token: accessToken, // Supabase JWT 토큰
      },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      newSocket.emit('joinRoom', { roomId });
    });

    newSocket.on('message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [accessToken, roomId]);

  const sendMessage = useCallback((content: string) => {
    if (socket) {
      socket.emit('message', { roomId, content });
    }
  }, [socket, roomId]);

  return { messages, sendMessage };
}
```

---

## 7. SEO 전략

### 7.1 데이터 분리

| 공개 (SSR/SEO) | 비공개 (권한 필요) |
|----------------|-------------------|
| 숙소 이름, 설명 | 상세 주소 |
| 대표 사진 | 호스트 연락처 |
| 가격 범위 | 채팅 가능 여부 |
| 시설/어메니티 | 예약 현황 |

### 7.2 API 엔드포인트 분리

```typescript
// NestJS Controller
@Controller('accommodations')
export class AccommodationsController {
  // 공개 API - 인증 불필요, SEO용
  @Get('public/:id')
  async getPublicAccommodation(@Param('id') id: string) {
    return this.service.getPublicAccommodation(id);
  }

  // 비공개 API - 인증 필요
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getAccommodation(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.getAccommodation(id, user);
  }
}
```

### 7.3 Next.js SSR 페이지

```typescript
// apps/web/src/app/[locale]/accommodations/[id]/page.tsx
import { apiClient } from '@/shared/api/client';

// 공개 API 사용 - SEO 최적화
export async function generateMetadata({ params }: Props) {
  const accommodation = await fetch(
    `${process.env.NEST_API_URL}/accommodations/public/${params.id}`
  ).then((res) => res.json());

  return {
    title: accommodation.roomName,
    description: accommodation.introduction,
    openGraph: {
      images: [accommodation.photos[0]?.url],
    },
  };
}

export default async function AccommodationPage({ params }: Props) {
  const accommodation = await fetch(
    `${process.env.NEST_API_URL}/accommodations/public/${params.id}`
  ).then((res) => res.json());

  return <AccommodationDetail data={accommodation} />;
}
```

---

## 8. 디렉토리 구조

```
snug/
├── apps/
│   ├── api/                          # NestJS API (SSOT)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # 인증 모듈
│   │   │   │   │   ├── strategies/
│   │   │   │   │   │   └── supabase-jwt.strategy.ts
│   │   │   │   │   ├── guards/
│   │   │   │   │   └── auth.module.ts
│   │   │   │   ├── accommodations/   # 숙소 모듈
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── accommodations.controller.ts
│   │   │   │   │   ├── accommodations.service.ts
│   │   │   │   │   └── accommodations.module.ts
│   │   │   │   ├── users/
│   │   │   │   ├── bookings/
│   │   │   │   └── chat/
│   │   │   ├── prisma/
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── web/                          # Next.js (BFF + SEO)
│       ├── src/
│       │   ├── app/
│       │   │   └── [locale]/
│       │   │       ├── host/         # 호스트 대시보드
│       │   │       └── accommodations/
│       │   ├── shared/
│       │   │   ├── api/
│       │   │   │   ├── client.ts     # NestJS API 클라이언트
│       │   │   │   └── accommodation/
│       │   │   │       └── actions.ts # Server Actions
│       │   │   ├── stores/
│       │   │   └── lib/
│       │   ├── features/
│       │   ├── views/
│       │   └── schemas/              # zod 스키마
│       └── package.json
│
├── packages/
│   ├── database/                     # Prisma 스키마 및 클라이언트
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   └── types/                        # 공유 타입 (순수 interface만)
│       ├── src/
│       │   ├── user.ts
│       │   ├── accommodation.ts
│       │   └── index.ts
│       └── package.json
│
└── package.json
```

---

## 9. 구현 가이드

### 9.1 새로운 기능 추가 체크리스트

1. **타입 정의** (`packages/types/`)
   - [ ] 순수 interface/type 정의
   - [ ] index.ts에서 export

2. **NestJS 구현** (`apps/api/`)
   - [ ] DTO 클래스 (class-validator)
   - [ ] Service 로직
   - [ ] Controller 엔드포인트
   - [ ] Module 등록
   - [ ] 권한 Guard 적용

3. **Next.js 연결** (`apps/web/`)
   - [ ] Server Action (apiClient 사용)
   - [ ] zod 스키마 (폼 검증용)
   - [ ] UI 컴포넌트

### 9.2 인증이 필요한 API 추가 시

```typescript
// NestJS Controller
@Controller('accommodations')
@UseGuards(JwtAuthGuard)  // 전체 컨트롤러에 적용
export class AccommodationsController {
  @Get()
  async getMyAccommodations(@CurrentUser() user: User) {
    // user는 Supabase JWT에서 추출된 DB User
    return this.service.findByHostId(user.id);
  }
}
```

### 9.3 공개 + 비공개 API 혼합 시

```typescript
@Controller('accommodations')
export class AccommodationsController {
  // 공개 API (인증 불필요)
  @Get('public/:id')
  async getPublic(@Param('id') id: string) {
    return this.service.getPublicData(id);
  }

  // 비공개 API (인증 필요)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPrivate(@Param('id') id: string, @CurrentUser() user: User) {
    return this.service.getFullData(id, user);
  }
}
```

---

## 부록: 자주 묻는 질문 (FAQ)

### Q: Server Action에서 DB를 직접 조회해도 되나요?
**A: 아니요.** Server Action은 반드시 `apiClient`를 통해 NestJS API를 호출해야 합니다. DB 직접 접근은 NestJS에서만 수행합니다.

### Q: 폼 검증은 어디서 하나요?
**A:**
- **UX용 (프론트엔드)**: Next.js에서 zod 스키마로 즉각적인 피드백
- **보안용 (백엔드)**: NestJS에서 class-validator로 최종 검증

### Q: SEO가 필요 없는 페이지는 어떻게 하나요?
**A:** 호스트 대시보드 같은 페이지는 SEO 불필요. 하지만 여전히 Server Action → NestJS API 패턴을 따라야 합니다.

### Q: 모바일 앱에서 인증은 어떻게 하나요?
**A:** Capacitor SecureStorage에 Supabase JWT 토큰 저장 → API 호출 시 Authorization 헤더에 포함

### Q: 쿠키 이름이 뭔가요?
**A:** Supabase Auth는 기본적으로 `sb-access-token` 쿠키에 토큰을 저장합니다. (프로젝트 설정에 따라 다를 수 있음)

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-26 | 1.0 | 초기 아키텍처 문서 작성 |

---

> **Note**: 이 문서는 프로젝트 발전에 따라 업데이트되어야 합니다. 아키텍처 변경 시 반드시 이 문서도 함께 수정해주세요.
