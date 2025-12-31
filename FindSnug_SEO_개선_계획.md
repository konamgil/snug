# FindSnug SEO 개선 계획

> 현재 SEO 상태 분석 및 구체적인 개선 방안
> 작성일: 2025-12-31

---

## 1. 현재 SEO 상태 분석

### 1.1 체크리스트

| 항목 | 상태 | 위치 | 영향도 |
|------|------|------|--------|
| 기본 메타데이터 (title, description) | ✅ 있음 | `[locale]/layout.tsx` | - |
| Open Graph 태그 | ✅ 있음 | `[locale]/layout.tsx` | - |
| Twitter Card | ✅ 있음 | `[locale]/layout.tsx` | - |
| 다국어 URL 구조 | ✅ 있음 | `/[locale]/...` | - |
| 파비콘 | ✅ 있음 | `layout.tsx` | - |
| **sitemap.xml** | ❌ 없음 | - | **치명적** |
| **robots.txt** | ❌ 없음 | - | **치명적** |
| **페이지별 메타데이터** | ❌ 없음 | - | **높음** |
| **구조화된 데이터 (JSON-LD)** | ❌ 없음 | - | **높음** |
| **hreflang 태그** | ❌ 없음 | - | **높음** |
| **canonical 태그** | ❌ 없음 | - | **중간** |
| 필터 URL 파라미터 반영 | ❌ 없음 | - | **중간** |

### 1.2 현재 메타데이터 구조

```typescript
// apps/web/src/app/[locale]/layout.tsx (현재)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const metadata = messages.metadata as { title: string; description: string };

  return {
    title: metadata.title,  // 모든 페이지 동일
    description: metadata.description,  // 모든 페이지 동일
    openGraph: { ... },
    twitter: { ... },
  };
}
```

**문제점:**
- 모든 페이지가 동일한 title/description 사용
- 검색 결과 페이지, 숙소 상세 페이지 모두 같은 메타데이터
- 구글 검색 결과에서 구분 불가

### 1.3 다국어 지원 현황

```typescript
// apps/web/src/i18n/config.ts
export const locales = ['en', 'ko', 'zh', 'ja', 'vi'] as const;
```

**문제점:**
- 5개 언어 지원하지만 hreflang 연결 없음
- 구글이 언어별 페이지 관계 인식 못함
- 잘못된 언어 버전이 검색 결과에 노출될 수 있음

---

## 2. 우선순위별 개선 방안

### 2.1 P0: 즉시 필요 (1주 내)

#### P0-1. robots.txt 생성

**파일 위치:** `apps/web/src/app/robots.ts`

```typescript
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.findsnug.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // API 엔드포인트
          '/auth/',          // 인증 관련
          '/host/',          // 호스트 대시보드 (비공개)
          '/*?sort=*',       // 정렬 파라미터 (중복 방지)
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/auth/', '/host/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
```

**효과:**
- 크롤러에게 크롤링 가이드 제공
- 불필요한 페이지 크롤링 방지 (크롤링 버짓 절약)
- sitemap 위치 알림

---

#### P0-2. sitemap.xml 동적 생성

**파일 위치:** `apps/web/src/app/sitemap.ts`

```typescript
import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.findsnug.com';
const locales = ['en', 'ko', 'zh', 'ja', 'vi'];

// API에서 숙소 목록 가져오기
async function getAccommodations() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.findsnug.com';
    const res = await fetch(`${apiUrl}/accommodations/public?limit=1000`, {
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch accommodations for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const accommodations = await getAccommodations();

  // 1. 정적 페이지
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/search', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/map', priority: 0.8, changeFrequency: 'daily' as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap(locale =>
    staticPages.map(page => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [l, `${baseUrl}/${l}${page.path}`])
        ),
      },
    }))
  );

  // 2. 동적 페이지 (숙소 상세)
  const roomEntries: MetadataRoute.Sitemap = locales.flatMap(locale =>
    accommodations.map((room: { id: string; updatedAt?: string }) => ({
      url: `${baseUrl}/${locale}/room/${room.id}`,
      lastModified: room.updatedAt ? new Date(room.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [l, `${baseUrl}/${l}/room/${room.id}`])
        ),
      },
    }))
  );

  return [...staticEntries, ...roomEntries];
}
```

**효과:**
- 구글이 모든 페이지 발견 가능
- 언어별 페이지 관계 명시 (alternates)
- 페이지 중요도 및 업데이트 빈도 제공
- 인덱싱 속도 3-5배 향상

---

#### P0-3. 검색 페이지 메타데이터

**파일 위치:** `apps/web/src/app/[locale]/search/page.tsx`

```typescript
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    roomType?: string;
  }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: 'seo' });

  const baseUrl = 'https://www.findsnug.com';
  const location = search.location || '';
  const roomType = search.roomType || '';

  // 동적 타이틀 생성
  let title: string;
  let description: string;

  if (location && roomType) {
    title = t('search.titleWithLocationAndType', { location, roomType });
    description = t('search.descriptionWithLocationAndType', { location, roomType });
  } else if (location) {
    title = t('search.titleWithLocation', { location });
    description = t('search.descriptionWithLocation', { location });
  } else {
    title = t('search.titleDefault');
    description = t('search.descriptionDefault');
  }

  // Canonical URL (정렬 파라미터 제외)
  const canonicalParams = new URLSearchParams();
  if (search.location) canonicalParams.set('location', search.location);
  if (search.checkIn) canonicalParams.set('checkIn', search.checkIn);
  if (search.checkOut) canonicalParams.set('checkOut', search.checkOut);
  if (search.guests) canonicalParams.set('guests', search.guests);
  // sort 파라미터는 canonical에서 제외

  const canonicalQuery = canonicalParams.toString();
  const canonicalPath = `/search${canonicalQuery ? `?${canonicalQuery}` : ''}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}${canonicalPath}`,
      languages: {
        'en': `${baseUrl}/en${canonicalPath}`,
        'ko': `${baseUrl}/ko${canonicalPath}`,
        'zh': `${baseUrl}/zh${canonicalPath}`,
        'ja': `${baseUrl}/ja${canonicalPath}`,
        'vi': `${baseUrl}/vi${canonicalPath}`,
        'x-default': `${baseUrl}/en${canonicalPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}${canonicalPath}`,
      siteName: 'Snug',
      type: 'website',
    },
  };
}
```

**다국어 메시지 추가 (messages/en.json):**

```json
{
  "seo": {
    "search": {
      "titleDefault": "Search Accommodations in Korea | Snug",
      "descriptionDefault": "Find your perfect home in Korea. Apartments, share houses, and rooms for foreigners.",
      "titleWithLocation": "Accommodations in {location} | Snug",
      "descriptionWithLocation": "Find your perfect home in {location}. Apartments, share houses, and rooms for foreigners in Korea.",
      "titleWithLocationAndType": "{roomType} in {location} | Snug",
      "descriptionWithLocationAndType": "Find the best {roomType} in {location}. Quality accommodations for foreigners in Korea."
    }
  }
}
```

---

#### P0-4. 숙소 상세 페이지 메타데이터

**파일 위치:** `apps/web/src/app/[locale]/room/[id]/page.tsx`

```typescript
import type { Metadata } from 'next';
import { getAccommodationPublic } from '@/shared/api/accommodation/actions';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const room = await getAccommodationPublic(id);

  if (!room) {
    return {
      title: 'Room Not Found | Snug',
      description: 'The requested accommodation could not be found.',
    };
  }

  const baseUrl = 'https://www.findsnug.com';
  const roomPath = `/room/${id}`;

  // 위치 문자열 생성
  const locationParts = [room.bnameEn, room.sigunguEn, room.sidoEn].filter(Boolean);
  const location = locationParts.join(', ');

  // 숙소 타입 표시명
  const typeNames: Record<string, string> = {
    HOUSE: 'House',
    SHARE_HOUSE: 'Share House',
    SHARE_ROOM: 'Share Room',
    APARTMENT: 'Apartment',
  };
  const typeName = typeNames[room.accommodationType] || room.accommodationType;

  // 타이틀 및 설명
  const title = `${room.roomName} - ${typeName} in ${location} | Snug`;
  const description = room.introduction?.slice(0, 155) + '...'
    || `${typeName} for rent in ${location}. ${room.roomCount} rooms, ${room.bathroomCount} bathrooms. From $${room.basePrice}/month.`;

  // 대표 이미지
  const ogImage = room.photos?.[0]?.url || `${baseUrl}/images/og_1200x630.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}${roomPath}`,
      languages: {
        'en': `${baseUrl}/en${roomPath}`,
        'ko': `${baseUrl}/ko${roomPath}`,
        'zh': `${baseUrl}/zh${roomPath}`,
        'ja': `${baseUrl}/ja${roomPath}`,
        'vi': `${baseUrl}/vi${roomPath}`,
        'x-default': `${baseUrl}/en${roomPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}${roomPath}`,
      siteName: 'Snug',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: room.roomName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
```

---

### 2.2 P1: 중요 (2주 내)

#### P1-1. 구조화된 데이터 (JSON-LD)

**파일 위치:** `apps/web/src/app/[locale]/room/[id]/page.tsx`

```typescript
import type { AccommodationPublic } from '@snug/types';

function AccommodationJsonLd({ room, locale }: { room: AccommodationPublic; locale: string }) {
  const baseUrl = 'https://www.findsnug.com';

  // 위치 정보
  const addressLocality = locale === 'ko' ? room.sigungu : room.sigunguEn;
  const addressRegion = locale === 'ko' ? room.sido : room.sidoEn;

  // 숙소 타입 매핑 (Schema.org 타입)
  const schemaTypes: Record<string, string> = {
    HOUSE: 'House',
    SHARE_HOUSE: 'Hostel',
    SHARE_ROOM: 'Room',
    APARTMENT: 'Apartment',
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': `${baseUrl}/${locale}/room/${room.id}`,
    name: room.roomName,
    description: room.introduction,
    url: `${baseUrl}/${locale}/room/${room.id}`,

    // 위치 정보
    address: {
      '@type': 'PostalAddress',
      addressLocality: addressLocality,
      addressRegion: addressRegion,
      addressCountry: 'KR',
    },

    // 좌표
    geo: room.latitude && room.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: room.latitude,
      longitude: room.longitude,
    } : undefined,

    // 가격
    priceRange: `$${room.basePrice}`,
    currencyAccepted: 'USD',

    // 이미지
    image: room.photos?.map(p => p.url) || [],

    // 숙소 정보
    numberOfRooms: room.roomCount,
    amenityFeature: room.facilities?.map(f => ({
      '@type': 'LocationFeatureSpecification',
      name: f,
      value: true,
    })),

    // 수용 인원
    maximumAttendeeCapacity: room.capacity,

    // 추가 정보
    additionalType: schemaTypes[room.accommodationType] || 'LodgingBusiness',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// 페이지 컴포넌트에서 사용
export default async function RoomDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const room = await getAccommodationPublic(id);

  if (!room) return notFound();

  return (
    <>
      <AccommodationJsonLd room={room} locale={locale} />
      <RoomDetailPageContent room={room} />
    </>
  );
}
```

**효과:**
- 구글 리치 스니펫 노출 (가격, 이미지, 위치 등)
- 검색 결과에서 시각적 차별화
- CTR 향상

---

#### P1-2. 홈페이지 구조화된 데이터

**파일 위치:** `apps/web/src/app/[locale]/page.tsx`

```typescript
function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Snug',
    alternateName: 'FindSnug',
    url: 'https://www.findsnug.com',
    logo: 'https://www.findsnug.com/images/logo/logo.svg',
    description: 'A New Housing Solution for Foreigners in Korea',
    sameAs: [
      // 소셜 미디어 링크 추가
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Korean', 'Chinese', 'Japanese', 'Vietnamese'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function WebSiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Snug',
    url: 'https://www.findsnug.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.findsnug.com/en/search?location={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

---

#### P1-3. hreflang 태그 (레이아웃 전역)

**파일 위치:** `apps/web/src/app/[locale]/layout.tsx` 수정

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const metadata = messages.metadata as { title: string; description: string };

  const siteUrl = 'https://www.findsnug.com';
  const ogImageUrl = `${siteUrl}/images/og_1200x630.png`;

  return {
    title: metadata.title,
    description: metadata.description,

    // hreflang 추가
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'en': `${siteUrl}/en`,
        'ko': `${siteUrl}/ko`,
        'zh': `${siteUrl}/zh`,
        'ja': `${siteUrl}/ja`,
        'vi': `${siteUrl}/vi`,
        'x-default': `${siteUrl}/en`,
      },
    },

    // 기존 설정 유지
    icons: { ... },
    openGraph: { ... },
    twitter: { ... },
  };
}
```

---

### 2.3 P2: 권장 (1개월 내)

#### P2-1. 필터 URL 파라미터 반영

**현재 문제:**
```typescript
// search-page.tsx (현재)
const [filterState, setFilterState] = useState<FilterState>({ ... });
// URL에 반영 안됨 → 새로고침 시 초기화, 공유 불가
```

**개선 방안:**
```typescript
// search-page.tsx (개선)
import { useRouter, useSearchParams } from 'next/navigation';

function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 필터 상태 읽기
  const filterState = useMemo(() => ({
    roomType: searchParams.get('roomType') || 'all',
    propertyTypes: searchParams.getAll('propertyType'),
    budgetMin: Number(searchParams.get('minPrice')) || 0,
    budgetMax: Number(searchParams.get('maxPrice')) || 10000,
    houseRules: searchParams.getAll('rules'),
    sort: searchParams.get('sort') || 'recommended',
  }), [searchParams]);

  // 필터 변경 시 URL 업데이트
  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.delete(key);
        value.forEach(v => params.append(key, v));
      } else if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    router.push(`/search?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  return ( ... );
}
```

**URL 형식:**
```
/search?location=Seoul&roomType=sharedHouse&propertyType=apartment&propertyType=villa&rules=womenOnly&minPrice=500&maxPrice=1500&sort=priceLow
```

---

#### P2-2. 검색 결과 페이지 구조화된 데이터

```typescript
function SearchResultsJsonLd({ results, location }: { results: AccommodationListItem[]; location: string }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Accommodations in ${location}`,
    numberOfItems: results.length,
    itemListElement: results.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LodgingBusiness',
        name: item.roomName,
        url: `https://www.findsnug.com/en/room/${item.id}`,
        image: item.thumbnailUrl,
        priceRange: `$${item.basePrice}`,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

---

### 2.4 P3: 선택 사항

#### P3-1. PDP URL 구조 변경

**현재:**
```
/room/cm5abc123def456
```

**SEO 최적화 버전:**
```
/room/shared-house/apartment/seoul/gangnam/yeoksam/cm5abc123
```

**구현 복잡도:** 높음
- 라우팅 구조 변경 필요
- 숙소 정보 변경 시 URL도 변경 → 301 리다이렉트 관리
- 기존 URL 호환성 유지 필요

**권장:** 현재로서는 비용 대비 효과가 낮아 보류

---

## 3. 구현 일정

### Phase 1: 기본 SEO (1주)

| 일차 | 작업 | 담당 |
|------|------|------|
| Day 1 | robots.ts 생성 | - |
| Day 1 | sitemap.ts 생성 | - |
| Day 2 | 검색 페이지 메타데이터 | - |
| Day 2 | 숙소 상세 페이지 메타데이터 | - |
| Day 3 | 다국어 SEO 메시지 추가 | - |
| Day 4 | 테스트 및 검증 | - |
| Day 5 | Google Search Console 등록 | - |

### Phase 2: 구조화된 데이터 (1주)

| 일차 | 작업 | 담당 |
|------|------|------|
| Day 1 | 숙소 상세 JSON-LD | - |
| Day 2 | 홈페이지 JSON-LD | - |
| Day 3 | hreflang 전역 적용 | - |
| Day 4-5 | 테스트 및 검증 | - |

### Phase 3: 고급 SEO (2주)

| 일차 | 작업 | 담당 |
|------|------|------|
| Week 1 | 필터 URL 파라미터 반영 | - |
| Week 2 | 검색 결과 JSON-LD | - |
| Week 2 | 성능 최적화 | - |

---

## 4. 검증 방법

### 4.1 도구

| 도구 | 용도 | URL |
|------|------|-----|
| Google Search Console | 인덱싱 상태, 오류 확인 | https://search.google.com/search-console |
| Google Rich Results Test | 구조화된 데이터 검증 | https://search.google.com/test/rich-results |
| Schema.org Validator | JSON-LD 문법 검증 | https://validator.schema.org |
| Ahrefs/SEMrush | SEO 분석 | - |
| PageSpeed Insights | 성능 분석 | https://pagespeed.web.dev |

### 4.2 체크리스트

- [ ] robots.txt 접근 가능 (`/robots.txt`)
- [ ] sitemap.xml 접근 가능 (`/sitemap.xml`)
- [ ] 각 페이지 고유한 title 확인
- [ ] 각 페이지 고유한 description 확인
- [ ] hreflang 태그 모든 언어에 적용 확인
- [ ] canonical 태그 올바르게 설정 확인
- [ ] JSON-LD 문법 오류 없음 확인
- [ ] Google Search Console에서 오류 없음 확인

---

## 5. 예상 효과

### 5.1 정량적 효과

| 지표 | 현재 예상 | 개선 후 예상 | 향상 |
|------|----------|-------------|------|
| 구글 인덱싱 페이지 수 | ~10 | ~1000+ | 100x |
| 평균 인덱싱 시간 | 2-4주 | 1-3일 | 10x 빠름 |
| 검색 결과 CTR | 1-2% | 3-5% | 2-3x |
| 오가닉 트래픽 | 기준 | +50-100% | 1.5-2x |

### 5.2 정성적 효과

- 브랜드 검색 시 정확한 페이지 노출
- 다국어 사용자에게 올바른 언어 버전 제공
- 리치 스니펫으로 검색 결과 차별화
- 롱테일 키워드 검색 유입 증가 (예: "강남 여성전용 쉐어하우스")

---

## 6. 참고 문서

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js Sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Google Search Central - Structured Data](https://developers.google.com/search/docs/appearance/structured-data)
- [Schema.org - LodgingBusiness](https://schema.org/LodgingBusiness)
- [Google - hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)

---

## 7. 코드 참조

| 파일 | 설명 |
|------|------|
| `apps/web/src/app/robots.ts` | robots.txt 생성 (신규) |
| `apps/web/src/app/sitemap.ts` | sitemap.xml 생성 (신규) |
| `apps/web/src/app/[locale]/layout.tsx` | 전역 메타데이터, hreflang |
| `apps/web/src/app/[locale]/search/page.tsx` | 검색 페이지 메타데이터 |
| `apps/web/src/app/[locale]/room/[id]/page.tsx` | 숙소 상세 메타데이터, JSON-LD |
| `apps/web/messages/*.json` | 다국어 SEO 메시지 |
