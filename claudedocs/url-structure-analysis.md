# URL 구조 분석 및 기획 문서

> **작성일**: 2025-12-30
> **비교 대상**: `# 메인 페이지 검색 결과 URL.md` (요구사항 문서) vs 현재 구현
> **목적**: 요구사항 문서와 현재 구현의 차이점 분석 및 대안 평가

---

## 목차

1. [개요](#1-개요)
   - 1.1 요구사항 문서 요약
   - 1.2 현재 구현 요약
   - **1.3 현재 구현 URL 파라미터 상세** ⭐
2. [검색 결과 페이지 (PLP) URL 비교](#2-검색-결과-페이지-plp-url-비교)
3. [검색 필터 URL 비교](#3-검색-필터-url-비교)
4. [숙소 상세 페이지 (PDP) URL 비교](#4-숙소-상세-페이지-pdp-url-비교)
5. [일치 항목 요약](#5-일치-항목-요약)
6. [차이점 상세 분석](#6-차이점-상세-분석)
7. [대안 평가](#7-대안-평가)
8. [구현 권장사항](#8-구현-권장사항)
9. [마이그레이션 계획](#9-마이그레이션-계획)

---

## 1. 개요

### 1.1 요구사항 문서 요약

요구사항 문서는 3가지 URL 구조를 정의합니다:

| 구분 | 예시 URL |
|------|----------|
| **메인 검색 결과** | `https://www.findsnug.com/room?&state=seoul-si&city=gangnam-gu&district=nonhyeon&startdate=2025-06-05&enddate=2025-06-19&adults=1` |
| **검색 필터** | `https://www.findsnug.com/room?item=shared-house&property=apartment&size=small&rules=women-only&facilities=parking&amenisies=queen-size-bed&sort=recommended` |
| **숙소 상세** | `https://www.findsnug.com/room/shared-house/apartment/seoul/gangnam/Cheongdam/apfn3250` |

### 1.2 현재 구현 요약

| 구분 | 예시 URL |
|------|----------|
| **메인 검색 결과** | `https://www.findsnug.com/search?location=Gangnam-gu&checkIn=2025-06-05&checkOut=2025-06-19&adults=1&children=0&infants=0` |
| **검색 필터** | 로컬 state로만 관리 (URL 반영 없음) |
| **숙소 상세** | `https://www.findsnug.com/room/clxxx123abc` |

### 1.3 현재 구현 URL 파라미터 상세

#### 검색 결과 페이지 (PLP) - `/search`

| 파라미터 | 타입 | 설명 | 예시 | 필수 |
|---------|------|------|------|------|
| `location` | string | 검색 지역 (통합) | `Gangnam-gu, Seoul` | ❌ |
| `checkIn` | string | 체크인 날짜 (YYYY-MM-DD) | `2025-06-05` | ❌ |
| `checkOut` | string | 체크아웃 날짜 (YYYY-MM-DD) | `2025-06-19` | ❌ |
| `guests` | number | 총 인원 (하위호환용) | `2` | ❌ |
| `adults` | number | 성인 수 | `1` | ❌ |
| `children` | number | 아이 수 | `0` | ❌ |
| `infants` | number | 유아 수 | `0` | ❌ |

**예시 URL**:
```
/search?location=Gangnam-gu&checkIn=2025-06-05&checkOut=2025-06-19&guests=2&adults=1&children=1&infants=0
```

#### 검색 필터 (URL 미반영, 로컬 State)

| 필터 | 타입 | 옵션 값 | 비고 |
|------|------|---------|------|
| `roomTypes` | string[] | `house`, `sharedHouse`, `sharedRoom` | 복수 선택 |
| `propertyTypes` | string[] | `apartment`, `villa`, `house`, `officetel` | 복수 선택 |
| `budgetMin` | number | 0~1000 (USD) | 기본값: 210 |
| `budgetMax` | number | 0~1000 (USD) | 기본값: 920 |
| `apartmentSize` | string | `≥58㎡`, `≥82㎡`, `≥92㎡` | 단일 선택 |
| `houseRules` | string[] | `womenOnly`, `menOnly`, `petsAllowed` | 복수 선택 |
| `facilities` | string[] | `parkingLot`, `lift`, `wifi`, `publicGate`, `fullyFurnished`, `privateBathroom`, `washingMachine`, `balcony` | 복수 선택 |
| `amenities` | string[] | `queenBed`, `airConditioning`, `dryer` | 복수 선택 |

#### 정렬 옵션 (URL 미반영, 로컬 State)

| 값 | 설명 |
|-----|------|
| `recommended` | 추천순 (기본값) |
| `newest` | 최신순 |
| `oldest` | 오래된순 |
| `priceHigh` | 높은 가격순 |
| `priceLow` | 낮은 가격순 |

#### 숙소 상세 페이지 (PDP) - `/room/[id]`

| 파라미터 | 타입 | 설명 | 예시 |
|---------|------|------|------|
| `id` (경로) | string | 숙소 고유 ID (cuid) | `clxxx123abc` |
| `checkIn` | string | 체크인 날짜 | `2025-06-05` |
| `checkOut` | string | 체크아웃 날짜 | `2025-06-19` |
| `guests` | number | 총 인원 | `2` |
| `adults` | number | 성인 수 | `1` |
| `children` | number | 아이 수 | `1` |
| `infants` | number | 유아 수 | `0` |

**예시 URL**:
```
/room/clxxx123abc?checkIn=2025-06-05&checkOut=2025-06-19&guests=2&adults=1&children=1&infants=0
```

#### API 검색 파라미터 (`AccommodationSearchParams`)

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `page` | number | 페이지 번호 |
| `limit` | number | 페이지당 개수 |
| `location` | string | 지역명 |
| `latitude` | number | 지도 중심 위도 |
| `longitude` | number | 지도 중심 경도 |
| `radius` | number | 검색 반경 (km) |
| `checkIn` | string | ISO 날짜 문자열 |
| `checkOut` | string | ISO 날짜 문자열 |
| `guests` | number | 인원 수 |
| `accommodationType` | AccommodationType[] | `HOUSE`, `SHARE_HOUSE`, `SHARE_ROOM` |
| `buildingType` | BuildingType[] | `APARTMENT`, `VILLA`, `HOUSE`, `OFFICETEL` |
| `minPrice` | number | 최소 가격 |
| `maxPrice` | number | 최대 가격 |
| `genderRules` | GenderRule[] | `MALE_ONLY`, `FEMALE_ONLY`, `PET_ALLOWED` |
| `sortBy` | string | `price_asc`, `price_desc`, `newest`, `recommended` |

---

## 2. 검색 결과 페이지 (PLP) URL 비교

### 2.1 기본 경로

| 항목 | 요구사항 문서 | 현재 구현 | 일치 여부 |
|------|-------------|----------|----------|
| **기본 경로** | `/room` | `/search` | ❌ 다름 |

**분석**:
- 요구사항: `/room?` 경로 사용
- 현재: `/search?` 경로 사용
- `/room`은 PDP(상세 페이지)와 경로가 겹치므로 catch-all 라우팅이 필요함

### 2.2 지역 파라미터

| 항목 | 요구사항 문서 | 현재 구현 | 일치 여부 |
|------|-------------|----------|----------|
| **시/도** | `&state=[값]` (예: `seoul-si`) | `location` 통합 | ❌ 다름 |
| **구/시** | `&city=[값]` (예: `gangnam-gu`) | `location` 통합 | ❌ 다름 |
| **동** | `&district=[값]` (예: `nonhyeon`) | `location` 통합 | ❌ 다름 |

**현재 구현 코드** (`search-page.tsx:125`):
```typescript
const [locationValue, setLocationValue] = useState(searchParams.get('location') || '');
```

**요구사항 변환 예시**:
- 현재: `?location=Gangnam-gu, Seoul`
- 요구사항: `?state=seoul&city=gangnam&district=nonhyeon`

**대안 평가**:
- 현재 `location` 방식은 사용자 입력을 그대로 저장하여 유연성이 높음
- 요구사항 방식은 SEO에 유리하고 구조화된 검색이 가능
- **DB에 `sido`, `sigungu`, `bname` 필드가 이미 존재하므로 구현 가능**

### 2.3 날짜 파라미터

| 항목 | 요구사항 문서 | 현재 구현 | 일치 여부 |
|------|-------------|----------|----------|
| **시작일** | `&startdate=YYYY-MM-DD` | `&checkIn=YYYY-MM-DD` | ❌ 파라미터명 다름 |
| **종료일** | `&enddate=YYYY-MM-DD` | `&checkOut=YYYY-MM-DD` | ❌ 파라미터명 다름 |
| **날짜 형식** | `YYYY-MM-DD` | `YYYY-MM-DD` | ✅ 동일 |

**현재 구현 코드** (`home-page.tsx:21-23`):
```typescript
if (params.checkIn) searchParams.set('checkIn', params.checkIn.toISOString().substring(0, 10));
if (params.checkOut) searchParams.set('checkOut', params.checkOut.toISOString().substring(0, 10));
```

**대안 평가**:
- 단순 파라미터명 변경으로 해결 가능
- `checkIn/checkOut`은 숙박업계 표준 용어
- `startdate/enddate`는 일반적인 기간 검색 용어
- **양쪽 모두 유효하며, 변경 시 기존 북마크/링크 리다이렉트 필요**

### 2.4 인원 파라미터

| 항목 | 요구사항 문서 | 현재 구현 | 일치 여부 |
|------|-------------|----------|----------|
| **성인** | `&adults=[값]` | `&adults=[값]` | ✅ 동일 |
| **아이** | `&children=[값]` | `&children=[값]` | ✅ 동일 |
| **유아** | `&infants=[값]` | `&infants=[값]` | ✅ 동일 |
| **0인 경우** | 파라미터 생략 | 파라미터 포함 | ⚠️ 부분 다름 |

**현재 구현 코드** (`home-page.tsx:25-29`):
```typescript
const totalGuests = params.guests.adults + params.guests.children;
if (totalGuests > 0) {
  searchParams.set('guests', totalGuests.toString());
  searchParams.set('adults', params.guests.adults.toString());
  searchParams.set('children', params.guests.children.toString());
  searchParams.set('infants', params.guests.infants.toString());
}
```

**대안 평가**:
- 인원 파라미터 구조는 거의 동일
- 현재는 `guests` (총 인원)도 추가로 전송 (하위 호환성)
- 0인 경우 생략하는 로직 추가 필요

---

## 3. 검색 필터 URL 비교

### 3.1 필터 URL 동기화 상태

| 항목 | 요구사항 문서 | 현재 구현 | 일치 여부 |
|------|-------------|----------|----------|
| **URL 동기화** | 모든 필터 URL 반영 | 로컬 state만 | ❌ 미구현 |

**현재 구현**: 필터는 `FilterModal` 컴포넌트의 로컬 state로만 관리
```typescript
// filter-modal.tsx
const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
```

### 3.2 룸타입 (Room Type)

| 항목 | 요구사항 문서 | 현재 구현 | 매핑 |
|------|-------------|----------|------|
| **집** | `&item=house` | `HOUSE` | ✅ 매핑 가능 |
| **셰어하우스** | `&item=shared-house` | `SHARE_HOUSE` | ✅ 매핑 가능 |
| **셰어룸** | `&item=shared-room` | `SHARE_ROOM` | ✅ 매핑 가능 |

**현재 구현 코드** (`search-page.tsx:30-34`):
```typescript
const roomTypeToAccommodationType: Record<string, AccommodationType> = {
  House: 'HOUSE',
  'Shared House': 'SHARE_HOUSE',
  'Shared Room': 'SHARE_ROOM',
};
```

### 3.3 숙소 종류 (Property Type)

| 항목 | 요구사항 문서 | 현재 구현 | 매핑 |
|------|-------------|----------|------|
| **아파트** | `&property=apartment` | `APARTMENT` | ✅ 매핑 가능 |
| **호텔** | `&property=hotel` | 미지원 | ❌ 추가 필요 |
| **모텔** | `&property=motel` | 미지원 | ❌ 추가 필요 |
| **Small Apartment** | `&property=small-apartment` | 미지원 | ❌ 추가 필요 |
| **빌라** | 미정의 | `VILLA` | ⚠️ 현재만 지원 |
| **오피스텔** | 미정의 | `OFFICETEL` | ⚠️ 현재만 지원 |
| **하우스** | 미정의 | `HOUSE` | ⚠️ 현재만 지원 |

**현재 구현 코드** (`search-page.tsx:36-41`):
```typescript
const propertyTypeToBuildingType: Record<string, BuildingType> = {
  Apartment: 'APARTMENT',
  Villa: 'VILLA',
  House: 'HOUSE',
  Officetel: 'OFFICETEL',
};
```

**차이점 분석**:
- 요구사항: 호텔, 모텔 등 숙박시설 포함
- 현재: 주거용 건물 타입 중심 (빌라, 오피스텔)
- **DB 스키마 `BuildingType` 확장 필요**

### 3.4 방 면적 (Apartment Size)

| 항목 | 요구사항 문서 | 현재 구현 | 일치 여부 |
|------|-------------|----------|----------|
| **58m² 미만** | `&size=small` | `≥58㎡` | ⚠️ 기준 다름 |
| **59m² ~ 82m²** | `&size=middle` | `≥82㎡` | ⚠️ 기준 다름 |
| **85m² 이상** | `&size=big` | `≥92㎡` | ⚠️ 기준 다름 |

**현재 구현** (`filter-modal.tsx:24`):
```typescript
const APARTMENT_SIZES = ['≥58㎡', '≥82㎡', '≥92㎡'];
```

**차이점 분석**:
- 요구사항: 범위 기반 (`small`, `middle`, `big`)
- 현재: 최소값 기반 (`≥58㎡`, `≥82㎡`, `≥92㎡`)
- **로직은 유사하나 URL 값과 기준이 다름**

### 3.5 숙소 규칙 (House Rules)

| 항목 | 요구사항 문서 | 현재 구현 | 매핑 |
|------|-------------|----------|------|
| **펫 가능** | `&rules=pet` | `PET_ALLOWED` | ✅ 매핑 가능 |
| **여성 전용** | `&rules=women-only` | `FEMALE_ONLY` | ✅ 매핑 가능 |
| **남성 전용** | `&rules=men-only` | `MALE_ONLY` | ✅ 매핑 가능 |
| **복수 선택** | 지원 | 지원 | ✅ 동일 |

**현재 구현 코드** (`search-page.tsx:43-47`):
```typescript
const houseRuleToGenderRule: Record<string, GenderRule> = {
  'Women Only': 'FEMALE_ONLY',
  'Men Only': 'MALE_ONLY',
  'Pets allowed': 'PET_ALLOWED',
};
```

### 3.6 시설 (Facilities)

| 항목 | 요구사항 문서 | 현재 구현 | 일치 여부 |
|------|-------------|----------|----------|
| **주차장** | `&facilities=parking` | `parkingLot` | ⚠️ 값 다름 |
| **리프트** | `&facilities=lift` | `lift` | ✅ 동일 |
| **WiFi** | `&facilities=wifi` | `wifi` | ✅ 동일 |

**현재 구현** (`filter-modal.tsx:58-68`):
```typescript
const FACILITIES = [
  { key: 'parkingLot', label: t('facilitiesOptions.parkingLot') },
  { key: 'lift', label: t('facilitiesOptions.lift') },
  { key: 'wifi', label: t('facilitiesOptions.wifi') },
  // ... 추가 시설들
];
```

### 3.7 편의시설 (Amenities)

| 항목 | 요구사항 문서 | 현재 구현 | 일치 여부 |
|------|-------------|----------|----------|
| **파라미터명** | `&amenisies=` (오타) | `amenities` | ⚠️ 오타 확인 필요 |
| **퀸베드** | `queen-size-bed` | `queenBed` | ⚠️ 값 다름 |
| **드라이어** | `dryer` | `dryer` | ✅ 동일 |

**주의**: 요구사항 문서에 `amenisies` 오타 있음 (정상: `amenities`)

### 3.8 정렬 (Sort)

| 항목 | 요구사항 문서 | 현재 구현 | 매핑 |
|------|-------------|----------|------|
| **추천순** | `&sort=recommended` | `recommended` | ✅ 동일 |
| **낮은가격순** | `&sort=price-low-to-high` | `priceLow` | ⚠️ 값 다름 |
| **높은가격순** | `&sort=price-high-to-low` | `priceHigh` | ⚠️ 값 다름 |
| **최신순** | 미정의 | `newest` | ⚠️ 현재만 지원 |
| **오래된순** | 미정의 | `oldest` | ⚠️ 현재만 지원 |

**현재 구현** (`sort-dropdown.tsx:7`):
```typescript
export type SortOption = 'recommended' | 'newest' | 'oldest' | 'priceHigh' | 'priceLow';
```

---

## 4. 숙소 상세 페이지 (PDP) URL 비교

### 4.1 URL 구조

| 항목 | 요구사항 문서 | 현재 구현 |
|------|-------------|----------|
| **구조** | `/room/[룸타입]/[종류]/[시/도]/[구/시]/[동]/[관리번호]` | `/room/[id]` |
| **예시** | `/room/shared-house/apartment/seoul/gangnam/Cheongdam/apfn3250` | `/room/clxxx123abc` |

### 4.2 경로 세그먼트 비교

| 세그먼트 | 요구사항 문서 | 현재 구현 | DB 필드 |
|----------|-------------|----------|---------|
| **룸타입** | `shared-house` | 미사용 | `accommodationType` |
| **종류** | `apartment` | 미사용 | `buildingType` |
| **시/도** | `seoul` | 미사용 | `sidoEn` ✅ |
| **구/시** | `gangnam` | 미사용 | `sigunguEn` ✅ |
| **동** | `Cheongdam` | 미사용 | `bnameEn` ✅ |
| **관리번호** | `apfn3250` | `clxxx123abc` (cuid) | `id` |

**현재 구현 코드** (`room-card.tsx:86`):
```typescript
return `/${locale}/room/${room.id}${queryString ? `?${queryString}` : ''}`;
```

### 4.3 DB 데이터 가용성

SEO URL 생성에 필요한 데이터가 **이미 DB에 존재**:

```typescript
// packages/types/src/accommodation.ts
interface Accommodation {
  // 위치 - 영문 (매핑 테이블에서 조회)
  sidoEn: string | null;      // Seoul
  sigunguEn: string | null;   // Gangnam-gu
  bnameEn: string | null;     // Yeoksam-dong

  // 타입 정보
  accommodationType: AccommodationType;  // HOUSE, SHARE_HOUSE, SHARE_ROOM
  buildingType: BuildingType | null;     // APARTMENT, VILLA, HOUSE, OFFICETEL
}
```

### 4.4 관리번호 (Slug) 분석

| 항목 | 요구사항 문서 | 현재 구현 |
|------|-------------|----------|
| **형식** | `apfn3250` (짧은 코드) | `clxxx123abc...` (cuid, 25자) |
| **가독성** | 높음 | 낮음 |
| **SEO** | 유리 | 불리 |
| **유일성** | 보장 필요 | 자동 보장 |

**대안 평가**:
1. **Option A**: 기존 cuid 유지
   - 장점: 변경 없음, 유일성 보장
   - 단점: URL 길이, SEO 불리

2. **Option B**: 새 slug 필드 추가
   - 형식: `{prefix}{random4digits}` (예: `apfn3250`)
   - 장점: 짧고 기억하기 쉬움
   - 단점: DB 스키마 변경, 기존 데이터 마이그레이션

3. **Option C**: 하이브리드
   - 새 URL로 라우팅, 기존 URL은 redirect
   - cuid를 slug로 사용하되 URL 구조만 변경

---

## 5. 일치 항목 요약

### 5.1 완전 일치 (변경 불필요)

| 항목 | 파라미터 | 비고 |
|------|---------|------|
| 성인 인원 | `adults` | ✅ |
| 아이 인원 | `children` | ✅ |
| 유아 인원 | `infants` | ✅ |
| 날짜 형식 | `YYYY-MM-DD` | ✅ |
| 정렬 - 추천순 | `recommended` | ✅ |
| 시설 - 리프트 | `lift` | ✅ |
| 시설 - WiFi | `wifi` | ✅ |
| 편의시설 - 드라이어 | `dryer` | ✅ |

### 5.2 부분 일치 (매핑 필요)

| 항목 | 요구사항 | 현재 | 매핑 난이도 |
|------|---------|------|-----------|
| 룸타입 값 | `house`, `shared-house`, `shared-room` | `HOUSE`, `SHARE_HOUSE`, `SHARE_ROOM` | 쉬움 |
| 숙소규칙 값 | `pet`, `women-only`, `men-only` | `PET_ALLOWED`, `FEMALE_ONLY`, `MALE_ONLY` | 쉬움 |
| 정렬 - 가격순 | `price-low-to-high` | `priceLow` | 쉬움 |

---

## 6. 차이점 상세 분석

### 6.1 구조적 차이 (Major)

| 차이점 | 영향도 | 변경 난이도 | 우선순위 |
|--------|-------|------------|---------|
| 검색 경로 `/search` → `/room` | 높음 | 중간 | 중 |
| PDP URL 구조 변경 | 매우 높음 | 높음 | 낮음 |
| 필터 URL 동기화 미구현 | 중간 | 중간 | 높음 |

### 6.2 파라미터명 차이 (Minor)

| 현재 | 요구사항 | 변경 난이도 |
|------|---------|-----------|
| `checkIn` | `startdate` | 쉬움 |
| `checkOut` | `enddate` | 쉬움 |
| `location` | `state/city/district` | 중간 |
| `priceLow` | `price-low-to-high` | 쉬움 |
| `priceHigh` | `price-high-to-low` | 쉬움 |

### 6.3 기능적 차이 (Functional)

| 항목 | 요구사항 | 현재 | 분석 |
|------|---------|------|------|
| **예산 URL** | URL 미포함 | 로컬 state | ✅ 요구사항과 일치 |
| **SEO canonical** | 정렬 제외 URL | 미구현 | 구현 필요 |
| **숙소타입 추가** | 호텔, 모텔 | 미지원 | DB 확장 필요 |

---

## 7. 대안 평가

### 7.1 검색 경로 변경 (`/search` → `/room`)

**Option A: 경로 변경**
- `/search` → `/room` 변경
- PDP와 catch-all 라우트로 구분
- 장점: 요구사항 준수
- 단점: 기존 링크 redirect 필요

**Option B: 현재 유지 (권장)**
- `/search` 유지
- 장점: 명확한 페이지 구분, 변경 최소화
- 단점: 요구사항과 다름
- **대안 근거**: `/search`는 검색 결과임을 명확히 표현하며, 많은 서비스에서 사용하는 패턴

### 7.2 지역 파라미터 구조

**Option A: 분리 구조 (요구사항)**
```
?state=seoul&city=gangnam&district=yeoksam
```
- 장점: SEO 유리, 구조화된 검색
- 단점: 구현 복잡도 증가

**Option B: 통합 구조 (현재)**
```
?location=Gangnam-gu, Seoul
```
- 장점: 유연한 입력, 구현 단순
- 단점: SEO 불리, 파싱 필요

**권장**: **Option A** - DB에 이미 분리된 데이터 존재

### 7.3 날짜 파라미터명

**Option A: 변경 (`startdate/enddate`)**
- 장점: 요구사항 준수, 범용적
- 단점: 기존 링크 호환성

**Option B: 유지 (`checkIn/checkOut`)**
- 장점: 숙박업계 표준, 변경 없음
- 단점: 요구사항과 다름

**권장**: **Option A** - 범용적이며 SEO에 유리

### 7.4 필터 URL 동기화

**Option A: 완전 동기화 (요구사항)**
- 모든 필터를 URL 파라미터로
- 장점: 링크 공유 가능, SEO
- 단점: URL 길어짐

**Option B: 선택적 동기화**
- 주요 필터만 URL 반영
- 장점: URL 간결
- 단점: 일부 필터 공유 불가

**권장**: **Option A** - 사용자 경험 및 SEO를 위해

### 7.5 PDP URL 구조

**Option A: SEO URL (요구사항)**
```
/room/shared-house/apartment/seoul/gangnam/cheongdam/apfn3250
```
- 장점: SEO 최적화, 의미 있는 URL
- 단점: 대규모 변경, slug 필드 추가

**Option B: 현재 유지**
```
/room/clxxx123abc
```
- 장점: 변경 없음
- 단점: SEO 불리, 가독성 낮음

**Option C: 하이브리드 (권장)**
```
/room/shared-house/apartment/seoul/gangnam/cheongdam/clxxx123abc
```
- 장점: SEO 개선, slug 필드 추가 불필요
- 단점: URL 길이

**권장**: **Option C** (단기) → **Option A** (장기)

---

## 8. 구현 권장사항

### 8.1 즉시 적용 (Phase 1) - 1~2일

| 작업 | 파일 | 복잡도 |
|------|------|-------|
| 날짜 파라미터명 변경 | `home-page.tsx`, `search-page.tsx` | 낮음 |
| 정렬 파라미터 값 변경 | `sort-dropdown.tsx` | 낮음 |
| 0인 인원 파라미터 생략 | `home-page.tsx` | 낮음 |

### 8.2 단기 적용 (Phase 2) - 3~5일

| 작업 | 파일 | 복잡도 |
|------|------|-------|
| 필터 URL 동기화 | `search-page.tsx`, `filter-modal.tsx` | 중간 |
| 지역 파라미터 분리 | `search-page.tsx`, `home-page.tsx` | 중간 |
| 시설/편의시설 키 통일 | `filter-modal.tsx` | 낮음 |

### 8.3 중기 적용 (Phase 3) - 1~2주

| 작업 | 파일 | 복잡도 |
|------|------|-------|
| PDP URL 구조 변경 | 라우트 구조, `room-card.tsx` | 높음 |
| 기존 URL redirect 설정 | `middleware.ts` | 중간 |
| SEO canonical 설정 | `layout.tsx` | 중간 |

### 8.4 장기 검토 (Phase 4)

| 작업 | 의존성 | 복잡도 |
|------|-------|-------|
| slug 필드 추가 | DB 스키마 변경 | 높음 |
| 검색 경로 변경 `/room` | catch-all 라우트 | 높음 |
| 숙소타입 확장 (호텔, 모텔) | DB enum 확장 | 중간 |

---

## 9. 마이그레이션 계획

### 9.1 하위 호환성 전략

```typescript
// 기존 파라미터 지원을 위한 매핑
const parameterAliases = {
  // 날짜
  checkIn: 'startdate',
  checkOut: 'enddate',

  // 정렬
  priceLow: 'price-low-to-high',
  priceHigh: 'price-high-to-low',
};

// URL 읽기 시 양쪽 모두 지원
const startDate = searchParams.get('startdate') || searchParams.get('checkIn');
```

### 9.2 Redirect 설정

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // 기존 /room/[id] → 새 구조로 redirect
  if (url.pathname.match(/^\/room\/[a-z0-9]+$/i)) {
    // 숙소 정보 조회 후 새 URL로 redirect
    return redirectToNewPdpUrl(url);
  }
}
```

### 9.3 점진적 롤아웃

1. **Week 1**: Phase 1 (파라미터명 변경) + 하위 호환 유지
2. **Week 2**: Phase 2 (필터 URL 동기화)
3. **Week 3-4**: Phase 3 (PDP URL 구조 변경)
4. **Month 2+**: Phase 4 (검토 후 결정)

---

## 부록

### A. 요구사항 문서 오타/오류

| 위치 | 오류 | 올바른 값 |
|------|------|----------|
| 편의시설 파라미터 | `amenisies` | `amenities` |
| 예시 URL | `&state=seoul-si` | `&state=seoul` (일관성) |

### B. 현재 구현 개선 제안

1. **TypeScript 타입 정의**: URL 파라미터용 타입 추가
2. **URL 유틸리티**: 파라미터 생성/파싱 헬퍼 함수
3. **테스트**: URL 호환성 테스트 작성

### C. 참고 파일 목록

| 파일 | 역할 |
|------|------|
| `apps/web/src/views/search/ui/search-page.tsx` | 검색 결과 페이지 |
| `apps/web/src/views/search/ui/filter-modal.tsx` | 필터 모달 |
| `apps/web/src/views/search/ui/sort-dropdown.tsx` | 정렬 드롭다운 |
| `apps/web/src/views/search/ui/room-card.tsx` | 숙소 카드 (링크 생성) |
| `apps/web/src/views/home/ui/home-page.tsx` | 홈 검색 |
| `apps/web/src/features/search/ui/search-modal.tsx` | 검색 모달 |
| `packages/types/src/accommodation.ts` | 숙소 타입 정의 |
| `packages/database/prisma/schema.prisma` | DB 스키마 |

---

*이 문서는 Claude Code에 의해 자동 생성되었습니다.*
