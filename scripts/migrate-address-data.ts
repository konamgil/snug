/**
 * Address Data Migration Script
 *
 * 기존 숙소 데이터의 주소를 구조화된 형식으로 마이그레이션합니다.
 * - 주소 문자열 파싱 (sido, sigungu, bname 추출)
 * - 영문 주소 매핑 테이블 조회
 * - 카카오 API로 좌표 조회
 *
 * 사용법:
 * npx ts-node scripts/migrate-address-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 카카오 API 호출
async function getCoordinates(address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    console.warn('KAKAO_REST_API_KEY not set, skipping geocoding');
    return null;
  }

  try {
    const url = new URL('https://dapi.kakao.com/v2/local/search/address.json');
    url.searchParams.set('query', address);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `KakaoAK ${apiKey}` },
    });

    if (!response.ok) {
      console.error(`Kakao API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.documents?.length > 0) {
      const doc = data.documents[0];
      return {
        lat: parseFloat(doc.y),
        lng: parseFloat(doc.x),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

// 주소 문자열 파싱 (간단한 휴리스틱)
function parseAddress(address: string): { sido: string; sigungu: string; bname: string } | null {
  if (!address || address.trim().length === 0) {
    return null;
  }

  // 일반적인 주소 패턴: "서울 강남구 역삼동 123" or "서울시 강남구 역삼동 123"
  const parts = address.split(/\s+/);
  if (parts.length < 3) {
    return null;
  }

  let sido = parts[0];
  let sigungu = parts[1];
  let bname = parts[2];

  // 시/도 정규화
  const sidoMap: Record<string, string> = {
    '서울': '서울특별시',
    '부산': '부산광역시',
    '대구': '대구광역시',
    '인천': '인천광역시',
    '광주': '광주광역시',
    '대전': '대전광역시',
    '울산': '울산광역시',
    '세종': '세종특별자치시',
    '경기': '경기도',
    '강원': '강원특별자치도',
    '충북': '충청북도',
    '충남': '충청남도',
    '전북': '전북특별자치도',
    '전남': '전라남도',
    '경북': '경상북도',
    '경남': '경상남도',
    '제주': '제주특별자치도',
  };

  // 약칭 변환
  for (const [short, full] of Object.entries(sidoMap)) {
    if (sido.startsWith(short)) {
      sido = full;
      break;
    }
  }

  return { sido, sigungu, bname };
}

// 영문 주소 조회
async function getEnglishAddress(
  sido: string,
  sigungu: string,
  bname: string
): Promise<{ sidoEn: string | null; sigunguEn: string | null; bnameEn: string | null }> {
  let sidoEn: string | null = null;
  let sigunguEn: string | null = null;
  let bnameEn: string | null = null;

  // 시/도 영문명 조회
  const sidoMapping = await prisma.addressMapping.findFirst({
    where: { sido, sigungu: null, bname: null },
  });
  sidoEn = sidoMapping?.sidoEn ?? null;

  // 구/군 영문명 조회
  const sigunguMapping = await prisma.addressMapping.findFirst({
    where: { sido, sigungu, bname: null },
  });
  sigunguEn = sigunguMapping?.sigunguEn ?? null;

  // 동/리 영문명 조회
  const bnameMapping = await prisma.addressMapping.findFirst({
    where: { sido, sigungu, bname },
  });
  bnameEn = bnameMapping?.bnameEn ?? null;

  return { sidoEn, sigunguEn, bnameEn };
}

async function migrateAccommodations() {
  console.log('Starting address data migration...\n');

  // 구조화된 주소가 없는 숙소 조회
  const accommodations = await prisma.accommodation.findMany({
    where: {
      sido: null,
      address: { not: '' },
    },
  });

  console.log(`Found ${accommodations.length} accommodations to migrate\n`);

  for (const acc of accommodations) {
    console.log(`Processing: ${acc.id} - ${acc.address}`);

    // 1. 주소 파싱
    const parsed = parseAddress(acc.address);
    if (!parsed) {
      console.log(`  ⚠️ Could not parse address: ${acc.address}`);
      continue;
    }

    console.log(`  📍 Parsed: ${parsed.sido} ${parsed.sigungu} ${parsed.bname}`);

    // 2. 영문 주소 조회
    const englishAddr = await getEnglishAddress(parsed.sido, parsed.sigungu, parsed.bname);
    console.log(`  🌐 English: ${englishAddr.sidoEn ?? 'N/A'} ${englishAddr.sigunguEn ?? 'N/A'} ${englishAddr.bnameEn ?? 'N/A'}`);

    // 3. 좌표 조회 (없는 경우만)
    let latitude = acc.latitude;
    let longitude = acc.longitude;

    if (latitude === null || longitude === null) {
      const coords = await getCoordinates(acc.address);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
        console.log(`  📌 Coordinates: ${latitude}, ${longitude}`);
      } else {
        console.log(`  ⚠️ Could not get coordinates`);
      }
    }

    // 4. 업데이트
    await prisma.accommodation.update({
      where: { id: acc.id },
      data: {
        sido: parsed.sido,
        sigungu: parsed.sigungu,
        bname: parsed.bname,
        sidoEn: englishAddr.sidoEn,
        sigunguEn: englishAddr.sigunguEn,
        bnameEn: englishAddr.bnameEn,
        latitude,
        longitude,
      },
    });

    console.log(`  ✅ Updated successfully\n`);
  }

  console.log('Migration completed!');
}

migrateAccommodations()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
