import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { User, Accommodation, AccommodationGroup } from '@snug/database';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccommodationDto, UpdateAccommodationDto } from './dto';
import { CreateAccommodationGroupDto, UpdateAccommodationGroupDto } from './dto';

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
  constructor(private readonly prisma: PrismaService) {}

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
   * 숙소 공개 정보 조회 (SEO용, 인증 불필요)
   */
  async findPublic(id: string) {
    const accommodation = await this.prisma.accommodation.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        facilities: true,
        amenities: true,
      },
    });

    if (!accommodation) {
      throw new NotFoundException('Accommodation not found');
    }

    // 공개 정보만 반환 (상세 주소 등 제외)
    return {
      id: accommodation.id,
      roomName: accommodation.roomName,
      accommodationType: accommodation.accommodationType,
      buildingType: accommodation.buildingType,
      usageTypes: accommodation.usageTypes,
      latitude: accommodation.latitude,
      longitude: accommodation.longitude,
      nearestStation: accommodation.nearestStation,
      walkingMinutes: accommodation.walkingMinutes,
      basePrice: accommodation.basePrice,
      includesUtilities: accommodation.includesUtilities,
      weekendPrice: accommodation.weekendPrice,
      managementFee: accommodation.managementFee,
      cleaningFee: accommodation.cleaningFee,
      capacity: accommodation.capacity,
      genderRules: accommodation.genderRules,
      sizeM2: accommodation.sizeM2,
      sizePyeong: accommodation.sizePyeong,
      roomCount: accommodation.roomCount,
      bathroomCount: accommodation.bathroomCount,
      bedCounts: accommodation.bedCounts,
      introduction: accommodation.introduction,
      photos: accommodation.photos,
      facilities: accommodation.facilities.map((f) => f.facilityCode),
      amenities: accommodation.amenities.map((a) => a.amenityCode),
    };
  }

  /**
   * 숙소 생성 + GUEST → HOST 역할 업그레이드
   */
  async create(
    user: User,
    dto: CreateAccommodationDto,
  ): Promise<{ accommodation: Accommodation; roleUpgraded: boolean }> {
    return this.prisma.$transaction(async (tx) => {
      // 1. 현재 유저 역할 확인
      const currentUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });

      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      // 2. 숙소 생성 (사진 포함)
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
          latitude: dto.latitude,
          longitude: dto.longitude,
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
        },
        include: {
          photos: {
            orderBy: { order: 'asc' },
          },
        },
      });

      // 3. GUEST인 경우 HOST로 역할 업그레이드
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
  }

  /**
   * 숙소 수정
   */
  async update(id: string, user: User, dto: UpdateAccommodationDto): Promise<Accommodation> {
    // 소유권 확인
    const existing = await this.prisma.accommodation.findUnique({
      where: { id },
      select: { hostId: true },
    });

    if (!existing) {
      throw new NotFoundException('Accommodation not found');
    }

    if (existing.hostId !== user.id) {
      throw new ForbiddenException('You do not have permission to update this accommodation');
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

    return this.prisma.accommodation.update({
      where: { id },
      data: updateData,
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
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
