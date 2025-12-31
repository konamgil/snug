# FindSnug URL 규칙 (현행)

> 실제 구현된 URL 규칙을 정리한 문서입니다.
> 작성일: 2025-12-31

---

## 1. 기본 구조

### 도메인 및 Locale
- **기본 URL**: `https://www.findsnug.com`
- **Locale 지원**: `/[locale]/` (en, ko, ja, zh, vi)
- **예시**: `https://www.findsnug.com/en/search`

### 주요 페이지 경로
| 페이지 | 경로 | 설명 |
|--------|------|------|
| 메인 페이지 | `/[locale]/` | 홈페이지 |
| 검색 결과 (PLP) | `/[locale]/search` | 숙소 목록 페이지 |
| 숙소 상세 (PDP) | `/[locale]/room/[id]` | 개별 숙소 페이지 |
| 지도 보기 | `/[locale]/map` | 지도 검색 페이지 |
| 갤러리 | `/[locale]/room/[id]/gallery` | 숙소 사진 갤러리 |
| 결제 | `/[locale]/room/[id]/payment` | 예약 결제 페이지 |

---

## 2. 메인 페이지 검색 결과 URL (PLP)

### 기본 URL
```
https://www.findsnug.com/[locale]/search?[파라미터]
```

### 검색 파라미터

| **항목** | **파라미터** | **형식** | **예시** | **비고** |
|----------|-------------|----------|----------|----------|
| **지역** | `location` | 텍스트 | `location=Gangnam-gu, Seoul` | 한글/영문 모두 지원, 쉼표로 구분 |
| **체크인** | `checkIn` | YYYY-MM-DD | `checkIn=2025-06-05` | ISO 날짜 형식 |
| **체크아웃** | `checkOut` | YYYY-MM-DD | `checkOut=2025-06-19` | ISO 날짜 형식 |
| **총 인원** | `guests` | 숫자 | `guests=2` | 성인+어린이 합계 (하위 호환용) |
| **성인** | `adults` | 숫자 | `adults=2` | 개별 인원수 |
| **어린이** | `children` | 숫자 | `children=1` | 개별 인원수 |
| **유아** | `infants` | 숫자 | `infants=0` | 개별 인원수 |

### URL 생성 규칙
- **원칙**: 값이 없거나 0인 파라미터는 URL에 포함하지 않음
- **인원수**: `guests`와 개별 파라미터(`adults`, `children`, `infants`) 모두 포함 (하위 호환성)

### 예시 URL
```
# 강남구, 서울에서 2025-06-05 ~ 2025-06-19, 성인 2명 검색
https://www.findsnug.com/en/search?location=Gangnam-gu%2C%20Seoul&checkIn=2025-06-05&checkOut=2025-06-19&guests=2&adults=2&children=0&infants=0

# 지역만 검색
https://www.findsnug.com/en/search?location=Seoul

# 인원만 지정
https://www.findsnug.com/en/search?guests=3&adults=2&children=1&infants=0
```

---

## 3. 검색 필터 (PLP) - 현재 상태

> **참고**: 현재 필터는 URL 파라미터가 아닌 클라이언트 상태로 관리됩니다.
> 필터 적용 시 URL이 변경되지 않으며, API 호출 시에만 파라미터로 전달됩니다.

### 룸타입 (Room Type)

| **UI 값** | **API 값** | **설명** |
|-----------|-----------|----------|
| `all` | (필터 없음) | 전체 |
| `house` | `HOUSE` | 집 |
| `sharedHouse` | `SHARE_HOUSE` | 쉐어하우스 |
| `sharedRoom` | `SHARE_ROOM` | 쉐어룸 |

### 숙소 종류 (Property Type)

| **UI 값** | **API 값** | **설명** |
|-----------|-----------|----------|
| `apartment` | `APARTMENT` | 아파트 |
| `villa` | `VILLA` | 빌라 |
| `house` | `HOUSE` | 주택 |
| `officetel` | `OFFICETEL` | 오피스텔 |

### 예산 (Budget)
- `budgetMin`: 최소 가격 (USD)
- `budgetMax`: 최대 가격 (USD)
- **범위**: 0 ~ 10,000

### 방 면적 (Apartment Size)

| **UI 표시** | **값** |
|-------------|--------|
| 58㎡ 이상 | `≥58㎡` |
| 82㎡ 이상 | `≥82㎡` |
| 92㎡ 이상 | `≥92㎡` |

### 숙소 규칙 (House Rules)

| **UI 값** | **API 값** | **설명** |
|-----------|-----------|----------|
| `womenOnly` | `FEMALE_ONLY` | 여성 전용 |
| `menOnly` | `MALE_ONLY` | 남성 전용 |
| `petsAllowed` | `PET_ALLOWED` | 반려동물 가능 |

### 시설 (Facilities)

| **UI 키** | **설명** |
|-----------|----------|
| `parkingLot` | 주차장 |
| `lift` | 엘리베이터 |
| `wifi` | WiFi |
| `publicGate` | 공동현관 |
| `fullyFurnished` | 풀옵션 |
| `privateBathroom` | 개인 욕실 |
| `washingMachine` | 세탁기 |
| `balcony` | 발코니 |

### 편의시설 (Amenities)

| **UI 키** | **설명** |
|-----------|----------|
| `queenBed` | 퀸 사이즈 침대 |
| `airConditioning` | 에어컨 |
| `dryer` | 건조기 |

---

## 4. 정렬 (Sort) - 현재 상태

> **참고**: 현재 정렬 옵션도 URL 파라미터가 아닌 클라이언트 상태로 관리됩니다.

| **UI 값** | **API 값** | **설명** |
|-----------|-----------|----------|
| `recommended` | `recommended` | 추천순 (기본값) |
| `newest` | `newest` | 최신순 |
| `oldest` | (미지원) | 오래된순 |
| `priceHigh` | `price_desc` | 높은 가격순 |
| `priceLow` | `price_asc` | 낮은 가격순 |

---

## 5. 숙소 상세 페이지 URL (PDP)

### 현재 구조
```
https://www.findsnug.com/[locale]/room/[id]
```

### 파라미터

| **항목** | **파라미터** | **형식** | **예시** |
|----------|-------------|----------|----------|
| **체크인** | `checkIn` | YYYY-MM-DD | `checkIn=2025-06-05` |
| **체크아웃** | `checkOut` | YYYY-MM-DD | `checkOut=2025-06-19` |
| **총 인원** | `guests` | 숫자 | `guests=2` |
| **성인** | `adults` | 숫자 | `adults=2` |
| **어린이** | `children` | 숫자 | `children=0` |
| **유아** | `infants` | 숫자 | `infants=0` |

### 예시 URL
```
# 숙소 상세 (검색 조건 유지)
https://www.findsnug.com/en/room/abc123-uuid?checkIn=2025-06-05&checkOut=2025-06-19&guests=2&adults=2&children=0&infants=0

# 숙소 상세 (기본)
https://www.findsnug.com/en/room/abc123-uuid
```

### ID 형식
- **형식**: UUID (예: `cm1234567890abcdef`)
- **생성**: Prisma CUID

---

## 6. API 검색 파라미터 (백엔드)

### 엔드포인트
```
GET /accommodations/public?[파라미터]
```

### 지원 파라미터

| **파라미터** | **타입** | **설명** |
|--------------|----------|----------|
| `page` | number | 페이지 번호 (기본: 1) |
| `limit` | number | 페이지당 개수 (기본: 20) |
| `location` | string | 지역명 (한글/영문) |
| `guests` | number | 최소 수용 인원 |
| `accommodationType` | string[] | 숙소 타입 (복수 선택) |
| `buildingType` | string[] | 건물 타입 (복수 선택) |
| `minPrice` | number | 최소 가격 |
| `maxPrice` | number | 최대 가격 |
| `genderRules` | string[] | 성별/반려동물 규칙 |
| `sortBy` | string | 정렬 기준 |

### 배열 파라미터 전달 방식
```
# 복수 선택 시
accommodationType=HOUSE&accommodationType=SHARE_HOUSE
buildingType=APARTMENT&buildingType=VILLA
genderRules=FEMALE_ONLY&genderRules=PET_ALLOWED
```

---

## 7. 지역 검색 (Location)

### 검색 방식
- **통합 검색**: 단일 `location` 파라미터로 시/도, 구/군, 동/리 통합 검색
- **다국어 지원**: 한글과 영문 모두 검색 가능
- **토큰 분리**: 쉼표, 공백으로 분리된 다중 토큰 지원

### 검색 예시
```
# 한글
location=강남구
location=강남구, 서울특별시
location=역삼동

# 영문
location=Gangnam-gu
location=Gangnam-gu, Seoul
location=Yeoksam-dong
```

### 데이터베이스 필드 매핑

| **필드** | **한글** | **영문** | **설명** |
|----------|----------|----------|----------|
| `sido` | 서울특별시 | `sidoEn`: Seoul | 시/도 |
| `sigungu` | 강남구 | `sigunguEn`: Gangnam-gu | 구/군 |
| `bname` | 역삼동 | `bnameEn`: Yeoksam-dong | 동/리 |

---

## 8. 외부 업체 지시서와의 차이점

| **항목** | **지시서** | **현재 구현** |
|----------|-----------|--------------|
| **검색 경로** | `/room?` | `/search?` |
| **지역 파라미터** | `state`, `city`, `district` 분리 | `location` 통합 |
| **날짜 파라미터** | `startdate`, `enddate` | `checkIn`, `checkOut` |
| **필터 URL 반영** | URL 파라미터로 반영 | 클라이언트 상태만 (URL 미반영) |
| **정렬 URL 반영** | URL 파라미터로 반영 | 클라이언트 상태만 (URL 미반영) |
| **PDP 경로** | `/room/[룸타입]/[종류]/[시도]/[구시]/[동]/[관리번호]` | `/room/[id]` |
| **Canonical 설정** | 정렬 파라미터 제외 | (미구현) |

---

## 9. 향후 개선 필요 사항

### URL 파라미터 반영 (SEO 개선)
1. **필터 파라미터 URL 반영**
   - `item` (룸타입)
   - `property` (숙소종류)
   - `rules` (숙소규칙)
   - `facilities` (시설)
   - `amenities` (편의시설)

2. **정렬 파라미터 URL 반영**
   - `sort` 파라미터 추가

3. **Canonical URL 설정**
   - 정렬 옵션 제외한 URL을 canonical로 설정

### 지역 파라미터 세분화 (선택적)
```
# 현재
location=강남구, 서울특별시

# 개선안 (지시서 방식)
state=seoul&city=gangnam&district=yeoksam
```
