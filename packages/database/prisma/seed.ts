import { PrismaClient, UserRole, AccommodationType, BuildingType, UsageType, AccommodationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // 1. USERS - 각 역할별 테스트 계정
  // ============================================

  // Guest (임차인)
  const guest = await prisma.user.upsert({
    where: { email: 'guest@snug.test' },
    update: {},
    create: {
      email: 'guest@snug.test',
      role: UserRole.GUEST,
      firstName: 'John',
      lastName: 'Doe',
      phone: '010-1234-5678',
      countryCode: '+1',
      phoneVerified: true,
      guestProfile: {
        create: {
          nationality: 'USA',
          purposeOfStay: 'WORK',
          aboutMe: 'Software developer working in Seoul',
        },
      },
    },
  });
  console.log('✅ Guest created:', guest.email);

  // Host (임대인)
  const host = await prisma.user.upsert({
    where: { email: 'host@snug.test' },
    update: {},
    create: {
      email: 'host@snug.test',
      role: UserRole.HOST,
      firstName: '민수',
      lastName: '김',
      phone: '010-9876-5432',
      countryCode: '+82',
      phoneVerified: true,
      hostProfile: {
        create: {
          businessName: '강남 셰어하우스',
          businessNumber: '123-45-67890',
          bankName: '신한은행',
          bankAccount: '110-123-456789',
          accountHolder: '김민수',
        },
      },
    },
  });
  console.log('✅ Host created:', host.email);

  // Co-Host (공동 호스트)
  const coHost = await prisma.user.upsert({
    where: { email: 'cohost@snug.test' },
    update: {},
    create: {
      email: 'cohost@snug.test',
      role: UserRole.CO_HOST,
      firstName: '지영',
      lastName: '박',
      phone: '010-5555-6666',
      countryCode: '+82',
      phoneVerified: true,
    },
  });
  console.log('✅ Co-Host created:', coHost.email);

  // Snug Operator (운영자)
  const operator = await prisma.user.upsert({
    where: { email: 'operator@snug.test' },
    update: {},
    create: {
      email: 'operator@snug.test',
      role: UserRole.SNUG_OPERATOR,
      firstName: '운영',
      lastName: '관리자',
      phone: '010-0000-0000',
      countryCode: '+82',
      phoneVerified: true,
    },
  });
  console.log('✅ Snug Operator created:', operator.email);

  // Partner (위탁협력 업체)
  const partner = await prisma.user.upsert({
    where: { email: 'partner@snug.test' },
    update: {},
    create: {
      email: 'partner@snug.test',
      role: UserRole.PARTNER,
      firstName: '청소',
      lastName: '업체',
      phone: '010-7777-8888',
      countryCode: '+82',
      phoneVerified: true,
      partnerProfile: {
        create: {
          companyName: '깔끔청소',
          serviceType: 'CLEANING',
          description: '전문 청소 서비스 제공',
        },
      },
    },
  });
  console.log('✅ Partner created:', partner.email);

  // ============================================
  // 2. HOST MEMBER - 공동 호스트 초대
  // ============================================

  const _hostMember = await prisma.hostMember.upsert({
    where: {
      hostId_memberId: {
        hostId: host.id,
        memberId: coHost.id,
      },
    },
    update: {},
    create: {
      hostId: host.id,
      memberId: coHost.id,
      permissions: {
        create: [
          { permission: 'CONTRACTS_VIEW', granted: true },
          { permission: 'CONTRACTS_MANAGE', granted: true },
          { permission: 'ACCOMMODATIONS_VIEW', granted: true },
          { permission: 'ACCOMMODATIONS_MANAGE', granted: false },
          { permission: 'CHAT_ACCESS', granted: true },
        ],
      },
    },
  });
  console.log('✅ Host Member relationship created');

  // ============================================
  // 3. ACCOMMODATION GROUP
  // ============================================

  const group = await prisma.accommodationGroup.upsert({
    where: { id: 'gangnam-sharehouse-group' },
    update: {},
    create: {
      id: 'gangnam-sharehouse-group',
      hostId: host.id,
      name: '강남 셰어하우스',
      address: '서울시 강남구 논현동 123-45',
    },
  });
  console.log('✅ Accommodation Group created:', group.name);

  // ============================================
  // 4. ACCOMMODATIONS (숙소)
  // ============================================

  const rooms = [
    {
      id: 'room-101',
      roomName: '101호',
      accommodationType: AccommodationType.SHARE_ROOM,
      buildingType: BuildingType.VILLA,
      basePrice: 800000,
      capacity: 2,
      roomCount: 1,
      bathroomCount: 1,
      sizeM2: 16.5,
      nearestStation: '논현역',
      walkingMinutes: 5,
    },
    {
      id: 'room-102',
      roomName: '102호',
      accommodationType: AccommodationType.SHARE_ROOM,
      buildingType: BuildingType.VILLA,
      basePrice: 750000,
      capacity: 1,
      roomCount: 1,
      bathroomCount: 1,
      sizeM2: 13.2,
      nearestStation: '논현역',
      walkingMinutes: 5,
    },
    {
      id: 'room-201',
      roomName: '201호 (전체)',
      accommodationType: AccommodationType.APARTMENT,
      buildingType: BuildingType.OFFICETEL,
      basePrice: 1500000,
      capacity: 4,
      roomCount: 2,
      bathroomCount: 1,
      livingRoomCount: 1,
      kitchenCount: 1,
      sizeM2: 33.0,
      nearestStation: '강남역',
      walkingMinutes: 10,
    },
  ];

  for (const room of rooms) {
    const accommodation = await prisma.accommodation.upsert({
      where: { id: room.id },
      update: {},
      create: {
        id: room.id,
        hostId: host.id,
        groupId: group.id,
        roomName: room.roomName,
        accommodationType: room.accommodationType,
        buildingType: room.buildingType,
        usageTypes: [UsageType.SHORT_TERM],
        minReservationDays: 30,
        address: '서울시 강남구 논현동 123-45',
        addressDetail: room.roomName,
        zipCode: '06120',
        latitude: 37.5145,
        longitude: 127.0352,
        nearestStation: room.nearestStation,
        walkingMinutes: room.walkingMinutes,
        basePrice: room.basePrice,
        includesUtilities: true,
        managementFee: 50000,
        cleaningFee: 30000,
        capacity: room.capacity,
        sizeM2: room.sizeM2,
        sizePyeong: room.sizeM2 ? Math.round(room.sizeM2 / 3.3 * 10) / 10 : null,
        roomCount: room.roomCount,
        livingRoomCount: room.livingRoomCount || 0,
        kitchenCount: room.kitchenCount || 0,
        bathroomCount: room.bathroomCount,
        bedCounts: { single: 1, queen: 0, king: 0 },
        houseRules: '- 실내 금연\n- 22시 이후 정숙\n- 애완동물 금지',
        introduction: '깨끗하고 편안한 셰어하우스입니다. 외국인 환영!',
        status: AccommodationStatus.ACTIVE,
        isOperating: true,
        openDate: new Date('2024-01-01'),
        facilities: {
          create: [
            { facilityCode: 'wifi' },
            { facilityCode: 'digital_lock' },
            { facilityCode: 'air_conditioner' },
            { facilityCode: 'washing_machine' },
            { facilityCode: 'refrigerator' },
          ],
        },
        amenities: {
          create: [
            { amenityCode: 'towel' },
            { amenityCode: 'bedding' },
            { amenityCode: 'toiletries' },
          ],
        },
        managers: {
          create: [
            {
              name: '김민수',
              phone: '010-9876-5432',
              additionalInfo: '호스트 본인',
            },
          ],
        },
      },
    });
    console.log('✅ Accommodation created:', accommodation.roomName);
  }

  // ============================================
  // 5. SAMPLE CONTRACT
  // ============================================

  const checkInDate = new Date();
  checkInDate.setMonth(checkInDate.getMonth() + 1);
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setMonth(checkOutDate.getMonth() + 3);

  const _contract = await prisma.contract.upsert({
    where: { id: 'sample-contract-1' },
    update: {},
    create: {
      id: 'sample-contract-1',
      guestId: guest.id,
      accommodationId: 'room-101',
      status: 'CONFIRMED',
      checkInDate,
      checkOutDate,
      nights: 90,
      guestCount: 1,
      basePrice: 800000 * 3,
      cleaningFee: 30000,
      managementFee: 50000 * 3,
      serviceFee: 100000,
      deposit: 500000,
      discount: 0,
      totalPrice: 800000 * 3 + 30000 + 50000 * 3 + 100000 + 500000,
      guestName: 'John Doe',
      guestGender: 'Male',
      guestContact: '+1 010-1234-5678',
      guestEmail: 'guest@snug.test',
      purpose: 'Work',
      detailRequest: 'Need quiet environment for remote work',
      paymentDay: 1,
    },
  });
  console.log('✅ Sample Contract created');

  // ============================================
  // 6. SAMPLE FAVORITE
  // ============================================

  await prisma.favorite.upsert({
    where: {
      userId_accommodationId: {
        userId: guest.id,
        accommodationId: 'room-201',
      },
    },
    update: {},
    create: {
      userId: guest.id,
      accommodationId: 'room-201',
    },
  });
  console.log('✅ Sample Favorite created');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📧 Test accounts:');
  console.log('   Guest:    guest@snug.test');
  console.log('   Host:     host@snug.test');
  console.log('   Co-Host:  cohost@snug.test');
  console.log('   Operator: operator@snug.test');
  console.log('   Partner:  partner@snug.test');
  console.log('\n⚠️  Note: These accounts need Supabase Auth registration for login.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
