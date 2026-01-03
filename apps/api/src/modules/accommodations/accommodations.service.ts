import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { User, Accommodation, AccommodationGroup, Prisma } from '@snug/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAccommodationDto,
  UpdateAccommodationDto,
  CreateAccommodationGroupDto,
  UpdateAccommodationGroupDto,
  SearchAccommodationsDto,
} from './dto';
import { GeocodingService } from './geocoding.service';
import { StorageService } from '../storage/storage.service';

/**
 * 다음 주소 API가 반환하는 짧은 시/도명을 전체 시/도명으로 변환
 * 예: "서울" → "서울특별시", "경기" → "경기도"
 */
const SIDO_NORMALIZATION_MAP: Record<string, string> = {
  서울: '서울특별시',
  부산: '부산광역시',
  대구: '대구광역시',
  인천: '인천광역시',
  광주: '광주광역시',
  대전: '대전광역시',
  울산: '울산광역시',
  세종: '세종특별자치시',
  경기: '경기도',
  강원: '강원특별자치도',
  충북: '충청북도',
  충남: '충청남도',
  전북: '전북특별자치도',
  전남: '전라남도',
  경북: '경상북도',
  경남: '경상남도',
  제주: '제주특별자치도',
};

/**
 * 전체 시/도명을 짧은 형태로 변환 (검색용)
 * 예: "서울특별시" → "서울", "경기도" → "경기"
 */
const SIDO_SHORT_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(SIDO_NORMALIZATION_MAP).map(([short, full]) => [full, short]),
);

/**
 * sido 값을 전체 형태로 정규화
 */
function normalizeSido(sido: string | null | undefined): string | null {
  if (!sido) return null;
  return SIDO_NORMALIZATION_MAP[sido] || sido;
}

/**
 * 검색어가 전체 시/도명인 경우 짧은 형태도 반환
 * 예: "서울특별시" → ["서울특별시", "서울"]
 */
function getSearchVariants(term: string): string[] {
  const variants = [term];
  const shortForm = SIDO_SHORT_MAP[term];
  if (shortForm) {
    variants.push(shortForm);
  }
  return variants;
}

/**
 * SQL Injection 방지: 검색 토큰 sanitization
 * 허용: 한글, 영문, 숫자, 하이픈
 * 제거: SQL 특수문자 (따옴표, 백슬래시, 세미콜론, 주석 등)
 */
function sanitizeSearchToken(token: string): string {
  // 허용된 문자만 남기기: 한글, 영문, 숫자, 하이픈
  return token.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ-]/g, '');
}

/**
 * SQL LIKE 패턴용 escape
 * %, _, \ 문자를 escape 처리
 */
function escapeSqlLikePattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

/**
 * 검색 토큰을 안전하게 처리 (sanitize + escape)
 */
function prepareSearchToken(token: string): string {
  const sanitized = sanitizeSearchToken(token);
  return escapeSqlLikePattern(sanitized);
}

/**
 * Accommodations Service
 *
 * 숙소 관련 비즈니스 로직을 담당합니다.
 * - 숙소 CRUD
 * - 숙소 그룹 CRUD
 * - GUEST → HOST 역할 업그레이드
 * - 소유권 검증
 */
@Injectable()
export class AccommodationsService {
  private readonly logger = new Logger(AccommodationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geocodingService: GeocodingService,
    private readonly storageService: StorageService,
  ) {}

  // ============================================
  // ACCOMMODATION CRUD
  // ============================================

  /**
   * 내 숙소 목록 조회
   */
  async findAllByHost(hostId: string): Promise<Accommodation[]> {
    return this.prisma.accommodation.findMany({
      where: { hostId },
      include: {
        group: true,
        photos: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 숙소 상세 조회
   */
  async findOne(id: string, user: User): Promise<Accommodation> {
    const accommodation = await this.prisma.accommodation.findUnique({
      where: { id },
      include: {
        group: true,
        photos: {
          orderBy: { order: 'asc' },
        },
        facilities: true,
        amenities: true,
        managers: true,
      },
    });

    if (!accommodation) {
      throw new NotFoundException('Accommodation not found');
    }

    // 소유자만 조회 가능
    if (accommodation.hostId !== user.id) {
      throw new ForbiddenException('You do not have permission to view this accommodation');
    }

    return accommodation;
  }

  /**
   * 숙소 가격 정보만 조회 (실시간 가격 확인용)
   * 프론트엔드에서 짧은 캐시 (30초)로 관리하여 가격 정확성 보장
   */
  async findPublicPrice(id: string) {
    const accommodation = await this.prisma.accommodation.findUnique({
      where: { id, status: 'ACTIVE', isOperating: true },
      select: {
        id: true,
        basePrice: true,
        includesUtilities: true,
        weekendPrice: true,
        weekendDays: true,
        managementFee: true,
        cleaningFee: true,
        extraPersonFee: true,
        petFee: true,
        updatedAt: true,
      },
    });

    if (!accommodation) {
      throw new NotFoundException('Accommodation not found or not operating');
    }

    return {
      id: accommodation.id,
      basePrice: accommodation.basePrice,
      includesUtilities: accommodation.includesUtilities,
      weekendPrice: accommodation.weekendPrice,
      weekendDays: accommodation.weekendDays,
      managementFee: accommodation.managementFee,
      cleaningFee: accommodation.cleaningFee,
      extraPersonFee: accommodation.extraPersonFee,
      petFee: accommodation.petFee,
      // 마지막 수정 시간 (캐시 무효화 힌트)
      updatedAt: accommodation.updatedAt,
    };
  }

  /**
   * 숙소 공개 정보 조회 (SEO용, 인증 불필요)
   */
  async findPublic(id: string) {
    const accommodation = await this.prisma.accommodation.findUnique({
      where: { id, status: 'ACTIVE', isOperating: true },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        facilities: true,
        amenities: true,
      },
    });

    if (!accommodation) {
      throw new NotFoundException('Accommodation not found or not operating');
    }

    // 공개 정보만 반환 (상세 주소 등 제외)
    return {
      id: accommodation.id,
      roomName: accommodation.roomName,
      accommodationType: accommodation.accommodationType,
      buildingType: accommodation.buildingType,
      usageTypes: accommodation.usageTypes,
      // 위치 정보 (상세 주소 제외)
      sido: accommodation.sido,
      sigungu: accommodation.sigungu,
      bname: accommodation.bname,
      sidoEn: accommodation.sidoEn,
      sigunguEn: accommodation.sigunguEn,
      bnameEn: accommodation.bnameEn,
      latitude: accommodation.latitude,
      longitude: accommodation.longitude,
      nearestStation: accommodation.nearestStation,
      walkingMinutes: accommodation.walkingMinutes,
      // 가격
      basePrice: accommodation.basePrice,
      includesUtilities: accommodation.includesUtilities,
      weekendPrice: accommodation.weekendPrice,
      weekendDays: accommodation.weekendDays,
      managementFee: accommodation.managementFee,
      cleaningFee: accommodation.cleaningFee,
      extraPersonFee: accommodation.extraPersonFee,
      petFee: accommodation.petFee,
      // 예약 조건
      minReservationDays: accommodation.minReservationDays,
      // 공간 정보
      capacity: accommodation.capacity,
      genderRules: accommodation.genderRules,
      sizeM2: accommodation.sizeM2,
      sizePyeong: accommodation.sizePyeong,
      roomCount: accommodation.roomCount,
      livingRoomCount: accommodation.livingRoomCount,
      kitchenCount: accommodation.kitchenCount,
      bathroomCount: accommodation.bathroomCount,
      terraceCount: accommodation.terraceCount,
      bedCounts: accommodation.bedCounts,
      // 텍스트 정보
      introduction: accommodation.introduction,
      houseRules: accommodation.houseRules,
      // 사진 및 시설
      photos: accommodation.photos,
      facilities: accommodation.facilities.map((f) => f.facilityCode),
      amenities: accommodation.amenities.map((a) => a.amenityCode),
    };
  }

  /**
   * 유사 숙소 조회
   * 같은 지역(sigungu) + 같은 숙소 타입, 현재 숙소 제외
   * 인증 불필요 - 미리보기/상세 페이지용
   */
  async findSimilar(accommodationId: string, limit: number = 6) {
    // 1. 현재 숙소 정보 조회
    const currentAccommodation = await this.prisma.accommodation.findUnique({
      where: { id: accommodationId },
      select: {
        id: true,
        sigungu: true,
        sido: true,
        accommodationType: true,
        hostId: true,
      },
    });

    if (!currentAccommodation) {
      throw new NotFoundException('Accommodation not found');
    }

    // 2. 유사 숙소 검색 조건
    const where: Prisma.AccommodationWhereInput = {
      status: 'ACTIVE',
      isOperating: true, // 운영중인 숙소만
      id: { not: accommodationId }, // 현재 숙소 제외
    };

    // 같은 지역 우선 (sigungu가 있으면 사용, 없으면 sido)
    if (currentAccommodation.sigungu) {
      where.sigungu = currentAccommodation.sigungu;
    } else if (currentAccommodation.sido) {
      where.sido = currentAccommodation.sido;
    }

    // 같은 숙소 타입
    if (currentAccommodation.accommodationType) {
      where.accommodationType = currentAccommodation.accommodationType;
    }

    // 3. 유사 숙소 조회
    const similarAccommodations = await this.prisma.accommodation.findMany({
      where,
      take: limit,
      orderBy: [
        { createdAt: 'desc' }, // 최신순
      ],
      include: {
        photos: {
          take: 1, // 대표 사진 1장만
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { photos: true },
        },
      },
    });

    // 4. 결과가 부족하면 같은 타입만으로 재검색
    if (similarAccommodations.length < limit) {
      const additionalWhere: Prisma.AccommodationWhereInput = {
        status: 'ACTIVE',
        isOperating: true, // 운영중인 숙소만
        id: {
          notIn: [accommodationId, ...similarAccommodations.map((a) => a.id)],
        },
        accommodationType: currentAccommodation.accommodationType,
      };

      const additionalAccommodations = await this.prisma.accommodation.findMany({
        where: additionalWhere,
        take: limit - similarAccommodations.length,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          photos: {
            take: 1,
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { photos: true },
          },
        },
      });

      similarAccommodations.push(...additionalAccommodations);
    }

    // 5. 공개 정보만 반환 (AccommodationListItem 타입과 일치)
    return similarAccommodations.map((acc) => ({
      id: acc.id,
      roomName: acc.roomName,
      accommodationType: acc.accommodationType,
      buildingType: acc.buildingType,
      latitude: acc.latitude,
      longitude: acc.longitude,
      nearestStation: acc.nearestStation,
      walkingMinutes: acc.walkingMinutes,
      sidoEn: acc.sidoEn,
      sigunguEn: acc.sigunguEn,
      basePrice: acc.basePrice,
      capacity: acc.capacity,
      roomCount: acc.roomCount,
      bathroomCount: acc.bathroomCount,
      thumbnailUrl: acc.photos[0]?.url || null,
      imageCount: acc._count.photos,
    }));
  }

  /**
   * 검색 필터 조건을 Prisma WHERE 객체로 변환
   */
  private buildSearchWhereConditions(dto: SearchAccommodationsDto): Prisma.AccommodationWhereInput {
    const {
      guests,
      accommodationType,
      buildingType,
      minPrice,
      maxPrice,
      genderRules,
      minArea,
      facilities,
      amenities,
      location,
    } = dto;

    const where: Prisma.AccommodationWhereInput = {
      status: 'ACTIVE',
      isOperating: true,
    };

    // 기본 필터들
    if (guests) where.capacity = { gte: guests };
    if (accommodationType?.length) where.accommodationType = { in: accommodationType };
    if (buildingType?.length) where.buildingType = { in: buildingType };
    if (genderRules?.length) where.genderRules = { hasSome: genderRules };
    if (minArea && minArea > 0) where.sizeM2 = { gte: minArea };

    // 가격 필터
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    // AND 조건들 수집
    const andConditions: Prisma.AccommodationWhereInput[] = [];

    // 시설 필터 (모든 시설 필수)
    if (facilities?.length) {
      andConditions.push(
        ...facilities.map((code) => ({ facilities: { some: { facilityCode: code } } })),
      );
    }

    // 편의시설 필터 (모든 편의시설 필수)
    if (amenities?.length) {
      andConditions.push(
        ...amenities.map((code) => ({ amenities: { some: { amenityCode: code } } })),
      );
    }

    // 위치 필터
    if (location) {
      const locationConditions = this.buildLocationConditions(location);
      if (locationConditions.length) andConditions.push(...locationConditions);
    }

    if (andConditions.length) where.AND = andConditions;

    return where;
  }

  /**
   * 위치 검색어를 Prisma 조건으로 변환
   */
  private buildLocationConditions(location: string): Prisma.AccommodationWhereInput[] {
    const tokens = location.split(/[,\s]+/).filter((token) => token.trim().length >= 2);
    if (!tokens.length) return [];

    return tokens.map((token) => {
      const trimmedToken = token.trim();
      const isEnglish = /[a-zA-Z]/.test(trimmedToken);

      if (isEnglish) {
        return {
          OR: [
            { sidoEn: { contains: trimmedToken, mode: 'insensitive' as const } },
            { sigunguEn: { contains: trimmedToken, mode: 'insensitive' as const } },
            { bnameEn: { contains: trimmedToken, mode: 'insensitive' as const } },
            { nearestStation: { contains: trimmedToken, mode: 'insensitive' as const } },
          ],
        };
      }

      const variants = getSearchVariants(trimmedToken);
      return {
        OR: variants.flatMap((variant) => [
          { address: { contains: variant } },
          { sido: { contains: variant } },
          { sigungu: { contains: variant } },
          { bname: { contains: variant } },
          { nearestStation: { contains: variant } },
        ]),
      };
    });
  }

  /**
   * 정렬 조건 변환
   */
  private getSortOrder(sortBy?: string): Prisma.AccommodationOrderByWithRelationInput {
    switch (sortBy) {
      case 'price_asc':
        return { basePrice: 'asc' };
      case 'price_desc':
        return { basePrice: 'desc' };
      case 'newest':
        return { createdAt: 'desc' };
      default:
        return { createdAt: 'desc' }; // recommended
    }
  }

  /**
   * 숙소 데이터를 목록 아이템으로 변환
   */
  private mapToListItem(
    acc: Accommodation & { photos: { url: string }[]; _count: { photos: number } },
  ) {
    return {
      id: acc.id,
      roomName: acc.roomName,
      accommodationType: acc.accommodationType,
      buildingType: acc.buildingType,
      latitude: acc.latitude,
      longitude: acc.longitude,
      nearestStation: acc.nearestStation,
      walkingMinutes: acc.walkingMinutes,
      sidoEn: acc.sidoEn,
      sigunguEn: acc.sigunguEn,
      basePrice: acc.basePrice,
      capacity: acc.capacity,
      roomCount: acc.roomCount,
      bathroomCount: acc.bathroomCount,
      thumbnailUrl: acc.photos[0]?.url || null,
      imageCount: acc._count.photos,
    };
  }

  /**
   * 공개 숙소 목록 조회 (검색/필터/페이지네이션)
   * 인증 불필요 - 검색 페이지용
   */
  async findPublicList(dto: SearchAccommodationsDto) {
    const { page = 1, limit = 20, sortBy = 'recommended' } = dto;

    const where = this.buildSearchWhereConditions(dto);
    const orderBy = this.getSortOrder(sortBy);

    const [total, accommodations] = await Promise.all([
      this.prisma.accommodation.count({ where }),
      this.prisma.accommodation.findMany({
        where,
        include: {
          photos: { orderBy: { order: 'asc' }, take: 1 },
          _count: { select: { photos: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: accommodations.map((acc) => this.mapToListItem(acc)),
      total,
      page,
      limit,
      hasNext: page * limit < total,
    };
  }

  /**
   * ACTIVE 전환 조건 검증 (Publish Gate)
   * - 사진 1장 이상
   * - 소개글 50자 이상
   * - 기본가 0원 초과
   */
  private validatePublishGate(accommodation: {
    photos?: { id: string }[];
    introduction?: string | null;
    basePrice: number;
  }): { canPublish: boolean; errors: string[] } {
    const errors: string[] = [];

    // 사진 검증
    const photoCount = accommodation.photos?.length ?? 0;
    if (photoCount < 1) {
      errors.push('At least 1 photo is required to publish');
    }

    // 소개글 검증
    const introLength = accommodation.introduction?.length ?? 0;
    if (introLength < 50) {
      errors.push('Introduction must be at least 50 characters');
    }

    // 기본가 검증
    if (accommodation.basePrice <= 0) {
      errors.push('Base price must be greater than 0 to publish');
    }

    return {
      canPublish: errors.length === 0,
      errors,
    };
  }

  /**
   * 주소 자동완성 검색 (최적화 버전 v2)
   * 단일 Raw SQL 쿼리로 AddressMapping + AddressAlias 동시 검색
   * PostgreSQL similarity() 함수로 DB에서 직접 관련성 점수 계산
   *
   * 성능: 기존 2-4 쿼리 → 1 쿼리로 통합
   * 결과 없을 시 추천 지역 반환 (OR 조건 fallback)
   */
  async searchAddresses(query: string, limit: number = 10) {
    if (!query || query.trim().length === 0) {
      return { data: [], isSuggested: false };
    }

    // limit 검증 (1-100 범위로 제한)
    const validatedLimit = Math.min(Math.max(Math.floor(limit) || 10, 1), 100);

    // 쿼리를 토큰으로 분리 (공백 기준) 후 sanitize
    const rawTokens = query
      .trim()
      .split(/\s+/)
      .filter((token) => token.length >= 2);

    if (rawTokens.length === 0) {
      return { data: [], isSuggested: false };
    }

    // SQL Injection 방지: 토큰 sanitize + escape
    const tokens = rawTokens.map((token) => prepareSearchToken(token)).filter((t) => t.length >= 2);

    if (tokens.length === 0) {
      return { data: [], isSuggested: false };
    }

    const tokenCount = tokens.length;
    const isEnglish = /[a-zA-Z]/.test(query);

    // 토큰 정규화: 하이픈과 공백 제거 (gangnamgu, gangnam-gu, gangnam gu 모두 매칭되도록)
    // 이미 sanitize된 토큰 사용
    const normalizedTokens = tokens.map((token) => token.replace(/[-\s]/g, '').toLowerCase());

    // SQL에서 컬럼 정규화 함수 (하이픈, 공백 제거 후 소문자)
    const normalizeCol = (col: string) => `LOWER(REPLACE(REPLACE(${col}, '-', ''), ' ', ''))`;

    // 결과 타입 정의
    type RawAddressResult = {
      label: string;
      labelKo: string;
      bname: string | null;
      sigungu: string | null;
      sido: string;
      bnameEn: string | null;
      sigunguEn: string | null;
      sidoEn: string;
      score: number;
      match_count: bigint;
    };

    // 별칭 검색 조건 (정규화된 비교)
    const aliasConditions = normalizedTokens
      .map((token) =>
        isEnglish
          ? `${normalizeCol('"aliasEn"')} LIKE '%${token}%'`
          : `alias LIKE '%${tokens[normalizedTokens.indexOf(token)]}%'`,
      )
      .join(' OR ');

    // 주소 매핑 검색 조건 (정규화된 비교)
    const mappingConditions = normalizedTokens
      .map((token, idx) =>
        isEnglish
          ? `(${normalizeCol('"sidoEn"')} LIKE '%${token}%' OR ${normalizeCol('"sigunguEn"')} LIKE '%${token}%' OR ${normalizeCol('"bnameEn"')} LIKE '%${token}%')`
          : `(sido LIKE '%${tokens[idx]}%' OR sigungu LIKE '%${tokens[idx]}%' OR bname LIKE '%${tokens[idx]}%')`,
      )
      .join(' OR ');

    // 매칭 카운트 계산 서브쿼리 (각 토큰이 매칭되는지 확인)
    const matchCountAlias = normalizedTokens
      .map((token, idx) =>
        isEnglish
          ? `CASE WHEN ${normalizeCol('"aliasEn"')} LIKE '%${token}%' THEN 1 ELSE 0 END`
          : `CASE WHEN alias LIKE '%${tokens[idx]}%' THEN 1 ELSE 0 END`,
      )
      .join(' + ');

    const matchCountMapping = normalizedTokens
      .map((token, idx) =>
        isEnglish
          ? `CASE WHEN ${normalizeCol('"sidoEn"')} LIKE '%${token}%' OR ${normalizeCol('"sigunguEn"')} LIKE '%${token}%' OR ${normalizeCol('"bnameEn"')} LIKE '%${token}%' THEN 1 ELSE 0 END`
          : `CASE WHEN sido LIKE '%${tokens[idx]}%' OR sigungu LIKE '%${tokens[idx]}%' OR bname LIKE '%${tokens[idx]}%' THEN 1 ELSE 0 END`,
      )
      .join(' + ');

    // 단일 Raw SQL 쿼리
    const results = await this.prisma.$queryRawUnsafe<RawAddressResult[]>(`
      WITH all_results AS (
        -- 별칭 테이블 검색
        SELECT DISTINCT ON ("targetSido", "targetSigungu", "targetBname")
          CASE
            WHEN "targetBname" IS NOT NULL THEN CONCAT("targetBnameEn", ', ', "targetSigunguEn", ', ', "targetSidoEn")
            ELSE CONCAT("targetSigunguEn", ', ', "targetSidoEn")
          END as label,
          CASE
            WHEN "targetBname" IS NOT NULL THEN CONCAT("targetBname", ', ', "targetSigungu", ', ', "targetSido")
            ELSE CONCAT("targetSigungu", ', ', "targetSido")
          END as "labelKo",
          "targetBname" as bname,
          "targetSigungu" as sigungu,
          "targetSido" as sido,
          "targetBnameEn" as "bnameEn",
          "targetSigunguEn" as "sigunguEn",
          "targetSidoEn" as "sidoEn",
          (${matchCountAlias}) as match_count,
          -- 관련성 점수: bname(10) + sigungu(5) + sido(2) + alias bonus(3)
          COALESCE(
            CASE WHEN "targetBname" IS NOT NULL THEN 10 ELSE 0 END +
            CASE WHEN "targetSigungu" IS NOT NULL THEN 5 ELSE 0 END +
            3,
            1
          )::float as score
        FROM address_aliases
        WHERE ${aliasConditions}

        UNION ALL

        -- 주소 매핑 테이블 검색 (동 레벨)
        SELECT DISTINCT ON (sido, sigungu, bname)
          CONCAT("bnameEn", ', ', "sigunguEn", ', ', "sidoEn") as label,
          CONCAT(bname, ', ', sigungu, ', ', sido) as "labelKo",
          bname,
          sigungu,
          sido,
          "bnameEn",
          "sigunguEn",
          "sidoEn",
          (${matchCountMapping}) as match_count,
          -- 관련성 점수: 토큰 매칭 위치에 따른 가중치 (정규화된 비교)
          (
            ${normalizedTokens
              .map((token, idx) =>
                isEnglish
                  ? `CASE WHEN ${normalizeCol('"bnameEn"')} LIKE '%${token}%' THEN 10 WHEN ${normalizeCol('"sigunguEn"')} LIKE '%${token}%' THEN 5 WHEN ${normalizeCol('"sidoEn"')} LIKE '%${token}%' THEN 2 ELSE 0 END`
                  : `CASE WHEN bname LIKE '%${tokens[idx]}%' THEN 10 WHEN sigungu LIKE '%${tokens[idx]}%' THEN 5 WHEN sido LIKE '%${tokens[idx]}%' THEN 2 ELSE 0 END`,
              )
              .join(' + ')}
          )::float as score
        FROM address_mappings
        WHERE bname IS NOT NULL AND (${mappingConditions})

        UNION ALL

        -- 주소 매핑 테이블 검색 (구 레벨)
        SELECT DISTINCT ON (sido, sigungu)
          CONCAT("sigunguEn", ', ', "sidoEn") as label,
          CONCAT(sigungu, ', ', sido) as "labelKo",
          NULL::text as bname,
          sigungu,
          sido,
          NULL::text as "bnameEn",
          "sigunguEn",
          "sidoEn",
          (${normalizedTokens
            .map((token, idx) =>
              isEnglish
                ? `CASE WHEN ${normalizeCol('"sigunguEn"')} LIKE '%${token}%' OR ${normalizeCol('"sidoEn"')} LIKE '%${token}%' THEN 1 ELSE 0 END`
                : `CASE WHEN sigungu LIKE '%${tokens[idx]}%' OR sido LIKE '%${tokens[idx]}%' THEN 1 ELSE 0 END`,
            )
            .join(' + ')}) as match_count,
          (
            ${normalizedTokens
              .map((token, idx) =>
                isEnglish
                  ? `CASE WHEN ${normalizeCol('"sigunguEn"')} LIKE '%${token}%' THEN 5 WHEN ${normalizeCol('"sidoEn"')} LIKE '%${token}%' THEN 2 ELSE 0 END`
                  : `CASE WHEN sigungu LIKE '%${tokens[idx]}%' THEN 5 WHEN sido LIKE '%${tokens[idx]}%' THEN 2 ELSE 0 END`,
              )
              .join(' + ')}
          )::float as score
        FROM address_mappings
        WHERE sigungu IS NOT NULL AND (${normalizedTokens
          .map((token, idx) =>
            isEnglish
              ? `(${normalizeCol('"sidoEn"')} LIKE '%${token}%' OR ${normalizeCol('"sigunguEn"')} LIKE '%${token}%')`
              : `(sido LIKE '%${tokens[idx]}%' OR sigungu LIKE '%${tokens[idx]}%')`,
          )
          .join(' OR ')})

        UNION ALL

        -- 주소 매핑 테이블 검색 (시/도 레벨)
        SELECT DISTINCT ON (sido)
          "sidoEn" as label,
          sido as "labelKo",
          NULL::text as bname,
          NULL::text as sigungu,
          sido,
          NULL::text as "bnameEn",
          NULL::text as "sigunguEn",
          "sidoEn",
          (${normalizedTokens
            .map((token, idx) =>
              isEnglish
                ? `CASE WHEN ${normalizeCol('"sidoEn"')} LIKE '%${token}%' THEN 1 ELSE 0 END`
                : `CASE WHEN sido LIKE '%${tokens[idx]}%' THEN 1 ELSE 0 END`,
            )
            .join(' + ')}) as match_count,
          (
            ${normalizedTokens
              .map((token, idx) =>
                isEnglish
                  ? `CASE WHEN ${normalizeCol('"sidoEn"')} LIKE '%${token}%' THEN 15 ELSE 0 END`
                  : `CASE WHEN sido LIKE '%${tokens[idx]}%' THEN 15 ELSE 0 END`,
              )
              .join(' + ')}
          )::float as score
        FROM address_mappings
        WHERE sigungu IS NULL AND bname IS NULL AND (${normalizedTokens
          .map((token, idx) =>
            isEnglish
              ? `(${normalizeCol('"sidoEn"')} LIKE '%${token}%')`
              : `(sido LIKE '%${tokens[idx]}%')`,
          )
          .join(' OR ')})
      )
      -- 최종 결과: 중복 제거, 점수순 정렬
      SELECT DISTINCT ON (label)
        label,
        "labelKo",
        bname,
        sigungu,
        sido,
        "bnameEn",
        "sigunguEn",
        "sidoEn",
        score,
        match_count
      FROM all_results
      ORDER BY label, match_count DESC, score DESC
    `);

    // 결과 처리
    if (results.length === 0) {
      return { data: [], isSuggested: false };
    }

    // AND 매칭 결과 (모든 토큰이 매칭된 것)
    const exactMatches = results.filter((r) => Number(r.match_count) >= tokenCount);

    if (exactMatches.length > 0) {
      // 점수순 정렬 후 limit 적용
      const sortedResults = exactMatches
        .sort((a, b) => Number(b.score) - Number(a.score))
        .slice(0, validatedLimit)
        .map(({ score: _score, match_count: _match_count, ...rest }) => rest);

      return { data: sortedResults, isSuggested: false };
    }

    // OR 매칭 결과 (일부 토큰만 매칭 - 추천 지역)
    const sortedResults = results
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, validatedLimit)
      .map(({ score: _score, match_count: _match_count, ...rest }) => rest);

    return {
      data: sortedResults,
      isSuggested: true,
    };
  }

  /**
   * 숙소 생성 + GUEST → HOST 역할 업그레이드
   */
  async create(
    user: User,
    dto: CreateAccommodationDto,
  ): Promise<{ accommodation: Accommodation; roleUpgraded: boolean }> {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 현재 유저 역할 확인
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });

      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      // 2. 좌표 조회 및 동 이름 추출 (도로명주소에서도 지번 정보 포함)
      let latitude = dto.latitude ?? null;
      let longitude = dto.longitude ?? null;
      let geocodedBname: string | undefined;

      // 좌표가 없거나 동 이름이 없으면 geocoding 수행
      if (latitude === null || longitude === null || !dto.bname) {
        const coords = await this.geocodingService.getCoordinatesWithFallback(
          dto.roadAddress,
          dto.address,
        );
        if (coords) {
          if (latitude === null || longitude === null) {
            latitude = coords.latitude;
            longitude = coords.longitude;
          }
          // 도로명주소로 입력해도 지번의 동 이름을 추출
          geocodedBname = coords.bname;
        }
      }

      // dto.bname이 없으면 geocoding 결과 사용
      const finalBname = dto.bname || geocodedBname || null;

      // 3. 영문 주소 조회 (매핑 테이블에서)
      let sidoEn: string | null = null;
      let sigunguEn: string | null = null;
      let bnameEn: string | null = null;

      // sido 정규화 (다음 주소 API가 "서울"을 반환하지만 매핑 테이블은 "서울특별시"로 저장됨)
      const normalizedSido = normalizeSido(dto.sido);

      if (normalizedSido) {
        // 시/도 영문명 조회
        const sidoMapping = await tx.addressMapping.findFirst({
          where: { sido: normalizedSido, sigungu: null, bname: null },
        });
        sidoEn = sidoMapping?.sidoEn ?? null;

        // 구/군 영문명 조회
        if (dto.sigungu) {
          const sigunguMapping = await tx.addressMapping.findFirst({
            where: { sido: normalizedSido, sigungu: dto.sigungu, bname: null },
          });
          sigunguEn = sigunguMapping?.sigunguEn ?? null;

          // 동/리 영문명 조회 (dto.bname 또는 geocodedBname 사용)
          if (finalBname) {
            const bnameMapping = await tx.addressMapping.findFirst({
              where: { sido: normalizedSido, sigungu: dto.sigungu, bname: finalBname },
            });
            bnameEn = bnameMapping?.bnameEn ?? null;
          }
        }
      }

      // 3. 숙소 생성 (사진 포함)
      const accommodation = await tx.accommodation.create({
        data: {
          hostId: user.id,
          groupId: dto.groupId,
          roomName: dto.roomName,
          accommodationType: dto.accommodationType,
          buildingType: dto.buildingType,
          usageTypes: dto.usageTypes,
          minReservationDays: dto.minReservationDays ?? 1,
          address: dto.address,
          addressDetail: dto.addressDetail,
          zipCode: dto.zipCode,
          roadAddress: dto.roadAddress,
          // 구조화된 주소
          sido: dto.sido,
          sigungu: dto.sigungu,
          bname: finalBname,
          buildingName: dto.buildingName,
          // 영문 주소 (매핑 테이블에서 조회)
          sidoEn,
          sigunguEn,
          bnameEn,
          // 좌표 (제공되지 않으면 geocoding으로 조회)
          latitude,
          longitude,
          nearestStation: dto.nearestStation,
          walkingMinutes: dto.walkingMinutes,
          basePrice: dto.basePrice,
          includesUtilities: dto.includesUtilities ?? false,
          weekendPrice: dto.weekendPrice,
          weekendDays: dto.weekendDays ?? [],
          managementFee: dto.managementFee,
          cleaningFee: dto.cleaningFee,
          extraPersonFee: dto.extraPersonFee,
          petFee: dto.petFee,
          capacity: dto.capacity ?? 1,
          genderRules: dto.genderRules ?? [],
          sizeM2: dto.sizeM2,
          sizePyeong: dto.sizePyeong,
          roomCount: dto.roomCount ?? 0,
          livingRoomCount: dto.livingRoomCount ?? 0,
          kitchenCount: dto.kitchenCount ?? 0,
          bathroomCount: dto.bathroomCount ?? 0,
          terraceCount: dto.terraceCount ?? 0,
          bedCounts: dto.bedCounts,
          houseRules: dto.houseRules,
          introduction: dto.introduction,
          status: dto.status ?? 'DRAFT',
          isOperating: dto.isOperating ?? false,
          // 사진이 있으면 함께 생성
          photos: dto.photos?.length
            ? {
                create: dto.photos.map((photo, index) => ({
                  category: photo.category,
                  url: photo.url,
                  order: photo.order ?? index,
                })),
              }
            : undefined,
          // 시설이 있으면 함께 생성
          facilities: dto.facilities?.length
            ? {
                create: dto.facilities.map((code) => ({
                  facilityCode: code,
                })),
              }
            : undefined,
          // 편의시설이 있으면 함께 생성
          amenities: dto.amenities?.length
            ? {
                create: dto.amenities.map((code) => ({
                  amenityCode: code,
                })),
              }
            : undefined,
        },
        include: {
          photos: {
            orderBy: { order: 'asc' },
          },
          facilities: true,
          amenities: true,
        },
      });

      // 5. GUEST인 경우 HOST로 역할 업그레이드
      let roleUpgraded = false;
      if (currentUser.role === 'GUEST') {
        await tx.user.update({
          where: { id: user.id },
          data: { role: 'HOST' },
        });

        // HostProfile 생성 (없으면)
        await tx.hostProfile.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
        });

        roleUpgraded = true;
      }

      return { accommodation, roleUpgraded };
    });

    // 트랜잭션 완료 후 temp 이미지를 영구 경로로 이동 (비동기, 논블로킹)
    this.moveTempPhotosToPermament(result.accommodation.id).catch((err) => {
      this.logger.error(
        `Failed to move temp photos for accommodation ${result.accommodation.id}:`,
        err,
      );
    });

    return result;
  }

  /**
   * temp 폴더의 사진을 영구 경로로 이동하고 DB 업데이트
   */
  private async moveTempPhotosToPermament(accommodationId: string): Promise<void> {
    // 해당 숙소의 사진 조회
    const photos = await this.prisma.accommodationPhoto.findMany({
      where: { accommodationId },
      select: { id: true, url: true },
    });

    // temp URL만 필터링
    const tempPhotos = photos.filter((p) => p.url.includes('/temp/'));
    if (tempPhotos.length === 0) {
      return;
    }

    this.logger.log(`Moving ${tempPhotos.length} temp photos for accommodation ${accommodationId}`);

    // 각 사진을 이동하고 DB 업데이트
    for (const photo of tempPhotos) {
      const newUrl = await this.storageService.moveFromTemp(photo.url, accommodationId);
      if (newUrl && newUrl !== photo.url) {
        await this.prisma.accommodationPhoto.update({
          where: { id: photo.id },
          data: { url: newUrl },
        });
        this.logger.log(`Updated photo ${photo.id}: ${photo.url} → ${newUrl}`);
      }
    }
  }

  /**
   * 숙소 수정
   */
  async update(id: string, user: User, dto: UpdateAccommodationDto): Promise<Accommodation> {
    // 소유권 확인 및 기본 정보 조회
    const existing = await this.prisma.accommodation.findUnique({
      where: { id },
      select: {
        hostId: true,
        status: true,
        basePrice: true,
        introduction: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Accommodation not found');
    }

    if (existing.hostId !== user.id) {
      throw new ForbiddenException('You do not have permission to update this accommodation');
    }

    // ACTIVE 전환 시 Publish Gate 검증
    if (dto.status === 'ACTIVE' && existing.status !== 'ACTIVE') {
      // 사진 정보 조회
      const photos = await this.prisma.accommodationPhoto.findMany({
        where: { accommodationId: id },
        select: { id: true },
      });

      // 업데이트 후 최종 값으로 검증
      const finalBasePrice = dto.basePrice ?? existing.basePrice;
      const finalIntroduction = dto.introduction ?? existing.introduction;

      const validation = this.validatePublishGate({
        photos,
        introduction: finalIntroduction,
        basePrice: finalBasePrice,
      });

      if (!validation.canPublish) {
        throw new BadRequestException({
          message: 'Cannot publish accommodation: requirements not met',
          errors: validation.errors,
        });
      }
    }

    // 업데이트 데이터 구성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    // groupId 특별 처리 (relation)
    if (dto.groupId !== undefined) {
      updateData.group = dto.groupId ? { connect: { id: dto.groupId } } : { disconnect: true };
    }

    // 나머지 필드들
    const directFields = [
      'roomName',
      'accommodationType',
      'buildingType',
      'usageTypes',
      'minReservationDays',
      'address',
      'addressDetail',
      'zipCode',
      'roadAddress',
      'sido',
      'sigungu',
      'bname',
      'buildingName',
      'latitude',
      'longitude',
      'nearestStation',
      'walkingMinutes',
      'basePrice',
      'includesUtilities',
      'weekendPrice',
      'weekendDays',
      'managementFee',
      'cleaningFee',
      'extraPersonFee',
      'petFee',
      'capacity',
      'genderRules',
      'sizeM2',
      'sizePyeong',
      'roomCount',
      'livingRoomCount',
      'kitchenCount',
      'bathroomCount',
      'terraceCount',
      'bedCounts',
      'houseRules',
      'introduction',
      'status',
      'isOperating',
    ];

    for (const field of directFields) {
      const value = (dto as Record<string, unknown>)[field];
      if (value !== undefined) {
        updateData[field] = value;
      }
    }

    // 주소가 변경되었고 (좌표가 제공되지 않았거나 bname이 없는 경우) geocoding
    let geocodedBname: string | undefined;
    if (
      (dto.address !== undefined || dto.roadAddress !== undefined) &&
      (dto.latitude === undefined || dto.longitude === undefined || !dto.bname)
    ) {
      const coords = await this.geocodingService.getCoordinatesWithFallback(
        dto.roadAddress ?? null,
        dto.address ?? null,
      );
      if (coords) {
        if (dto.latitude === undefined || dto.longitude === undefined) {
          updateData.latitude = coords.latitude;
          updateData.longitude = coords.longitude;
        }
        // 도로명주소로 입력해도 지번의 동 이름을 추출
        geocodedBname = coords.bname;
      }
    }

    // dto.bname이 없고 geocoding에서 추출된 bname이 있으면 사용
    if (!dto.bname && geocodedBname) {
      updateData.bname = geocodedBname;
    }

    // finalBname 결정 (영문명 조회용)
    const finalBname = dto.bname || geocodedBname || null;

    // 주소가 변경된 경우 영문 주소 조회
    if (dto.sido !== undefined) {
      // sido 정규화 (다음 주소 API가 "서울"을 반환하지만 매핑 테이블은 "서울특별시"로 저장됨)
      const normalizedSido = normalizeSido(dto.sido);

      if (normalizedSido) {
        // 시/도 영문명 조회
        const sidoMapping = await this.prisma.addressMapping.findFirst({
          where: { sido: normalizedSido, sigungu: null, bname: null },
        });
        updateData.sidoEn = sidoMapping?.sidoEn ?? null;

        // 구/군 영문명 조회
        if (dto.sigungu) {
          const sigunguMapping = await this.prisma.addressMapping.findFirst({
            where: { sido: normalizedSido, sigungu: dto.sigungu, bname: null },
          });
          updateData.sigunguEn = sigunguMapping?.sigunguEn ?? null;

          // 동/리 영문명 조회 (dto.bname 또는 geocodedBname 사용)
          if (finalBname) {
            const bnameMapping = await this.prisma.addressMapping.findFirst({
              where: { sido: normalizedSido, sigungu: dto.sigungu, bname: finalBname },
            });
            updateData.bnameEn = bnameMapping?.bnameEn ?? null;
          }
        }
      } else {
        // sido가 null/빈값이면 영문 주소도 초기화
        updateData.sidoEn = null;
        updateData.sigunguEn = null;
        updateData.bnameEn = null;
      }
    }

    // photos 처리: 기존 사진 삭제 후 새 사진 생성 (replace-all 전략)
    if (dto.photos !== undefined) {
      await this.prisma.$transaction(async (tx) => {
        // 기존 사진 삭제
        await tx.accommodationPhoto.deleteMany({
          where: { accommodationId: id },
        });

        // 새 사진 생성
        if (dto.photos && dto.photos.length > 0) {
          await tx.accommodationPhoto.createMany({
            data: dto.photos.map((photo, index) => ({
              accommodationId: id,
              category: photo.category,
              url: photo.url,
              order: photo.order ?? index,
            })),
          });
        }
      });
    }

    // facilities 처리: 기존 시설 삭제 후 새 시설 생성 (replace-all 전략)
    if (dto.facilities !== undefined) {
      await this.prisma.$transaction(async (tx) => {
        // 기존 시설 삭제
        await tx.accommodationFacility.deleteMany({
          where: { accommodationId: id },
        });

        // 새 시설 생성
        if (dto.facilities && dto.facilities.length > 0) {
          await tx.accommodationFacility.createMany({
            data: dto.facilities.map((code) => ({
              accommodationId: id,
              facilityCode: code,
            })),
          });
        }
      });
    }

    // amenities 처리: 기존 편의시설 삭제 후 새 편의시설 생성 (replace-all 전략)
    if (dto.amenities !== undefined) {
      await this.prisma.$transaction(async (tx) => {
        // 기존 편의시설 삭제
        await tx.accommodationAmenity.deleteMany({
          where: { accommodationId: id },
        });

        // 새 편의시설 생성
        if (dto.amenities && dto.amenities.length > 0) {
          await tx.accommodationAmenity.createMany({
            data: dto.amenities.map((code) => ({
              accommodationId: id,
              amenityCode: code,
            })),
          });
        }
      });
    }

    return this.prisma.accommodation.update({
      where: { id },
      data: updateData,
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        facilities: true,
        amenities: true,
      },
    });
  }

  /**
   * 숙소 삭제
   */
  async remove(id: string, user: User): Promise<void> {
    // 소유권 확인
    const existing = await this.prisma.accommodation.findUnique({
      where: { id },
      select: { hostId: true },
    });

    if (!existing) {
      throw new NotFoundException('Accommodation not found');
    }

    if (existing.hostId !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this accommodation');
    }

    await this.prisma.accommodation.delete({
      where: { id },
    });
  }

  // ============================================
  // ACCOMMODATION GROUP CRUD
  // ============================================

  /**
   * 숙소 그룹 목록 조회
   */
  async findAllGroups(hostId: string): Promise<AccommodationGroup[]> {
    return this.prisma.accommodationGroup.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 숙소 그룹 생성
   */
  async createGroup(user: User, dto: CreateAccommodationGroupDto): Promise<AccommodationGroup> {
    return this.prisma.accommodationGroup.create({
      data: {
        hostId: user.id,
        name: dto.name,
        address: dto.address,
      },
    });
  }

  /**
   * 숙소 그룹 수정
   */
  async updateGroup(
    id: string,
    user: User,
    dto: UpdateAccommodationGroupDto,
  ): Promise<AccommodationGroup> {
    // 소유권 확인
    const existing = await this.prisma.accommodationGroup.findUnique({
      where: { id },
      select: { hostId: true },
    });

    if (!existing) {
      throw new NotFoundException('Accommodation group not found');
    }

    if (existing.hostId !== user.id) {
      throw new ForbiddenException('You do not have permission to update this group');
    }

    return this.prisma.accommodationGroup.update({
      where: { id },
      data: {
        name: dto.name,
        address: dto.address,
      },
    });
  }

  /**
   * 숙소 그룹 삭제
   */
  async removeGroup(id: string, user: User): Promise<void> {
    // 소유권 확인
    const existing = await this.prisma.accommodationGroup.findUnique({
      where: { id },
      select: { hostId: true },
    });

    if (!existing) {
      throw new NotFoundException('Accommodation group not found');
    }

    if (existing.hostId !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this group');
    }

    await this.prisma.accommodationGroup.delete({
      where: { id },
    });
  }
}
