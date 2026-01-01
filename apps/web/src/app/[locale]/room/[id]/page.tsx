import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { AccommodationPublic } from '@snug/types';
import { getAccommodationPublic } from '@/shared/api/accommodation/actions';
import { accommodationKeys } from '@/shared/api/accommodation/hooks';
import { RoomDetailPage } from '@/views/room-detail';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

// JSON-LD 구조화된 데이터 컴포넌트
function AccommodationJsonLd({ room, locale }: { room: AccommodationPublic; locale: string }) {
  const siteUrl = 'https://www.findsnug.com';

  // 위치 정보
  const addressLocality = locale === 'ko' ? room.sigungu : room.sigunguEn;
  const addressRegion = locale === 'ko' ? room.sido : room.sidoEn;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': `${siteUrl}/${locale}/room/${room.id}`,
    name: room.roomName,
    description: room.introduction,
    url: `${siteUrl}/${locale}/room/${room.id}`,

    // 위치 정보
    address: {
      '@type': 'PostalAddress',
      addressLocality: addressLocality || undefined,
      addressRegion: addressRegion || undefined,
      addressCountry: 'KR',
    },

    // 좌표
    ...(room.latitude && room.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: room.latitude,
            longitude: room.longitude,
          },
        }
      : {}),

    // 가격
    priceRange: `$${room.basePrice}/month`,

    // 이미지
    image: room.photos?.map((p) => p.url) || [],

    // 숙소 정보
    numberOfRooms: room.roomCount,
    maximumAttendeeCapacity: room.capacity,

    // 시설
    amenityFeature: [
      ...(room.facilities?.map((f) => ({
        '@type': 'LocationFeatureSpecification',
        name: f,
        value: true,
      })) || []),
      ...(room.amenities?.map((a) => ({
        '@type': 'LocationFeatureSpecification',
        name: a,
        value: true,
      })) || []),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const room = await getAccommodationPublic(id);

  const siteUrl = 'https://www.findsnug.com';
  const path = `/room/${id}`;

  if (!room) {
    return {
      title: 'Room Not Found | Snug',
      description: 'The requested accommodation could not be found.',
    };
  }

  // 위치 문자열
  const locationParts = [room.bnameEn, room.sigunguEn, room.sidoEn].filter(Boolean);
  const location = locationParts.join(', ') || 'Korea';

  // 숙소 타입 표시명
  const typeNames: Record<string, string> = {
    HOUSE: 'House',
    SHARE_HOUSE: 'Share House',
    SHARE_ROOM: 'Share Room',
    APARTMENT: 'Apartment',
  };
  const typeName = typeNames[room.accommodationType] || 'Accommodation';

  // 메타데이터
  const title = `${room.roomName} - ${typeName} in ${location} | Snug`;
  const description =
    room.introduction?.slice(0, 155) ||
    `${typeName} for rent in ${location}. ${room.roomCount} rooms, ${room.bathroomCount} bathrooms. From $${room.basePrice}/month.`;

  // 대표 이미지
  const ogImage = room.photos?.[0]?.url || `${siteUrl}/images/og_1200x630.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}${path}`,
      languages: {
        en: `${siteUrl}/en${path}`,
        ko: `${siteUrl}/ko${path}`,
        zh: `${siteUrl}/zh${path}`,
        ja: `${siteUrl}/ja${path}`,
        vi: `${siteUrl}/vi${path}`,
        'x-default': `${siteUrl}/en${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}${path}`,
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

export default async function RoomDetailRoute({ params }: Props) {
  const { locale, id } = await params;

  // Create a new QueryClient for server-side prefetching
  const queryClient = new QueryClient();

  // Prefetch accommodation data - this will be shared with the client
  await queryClient.prefetchQuery({
    queryKey: accommodationKeys.detail(id),
    queryFn: () => getAccommodationPublic(id),
  });

  // Get the prefetched data for JSON-LD (already cached, no extra API call)
  const room = queryClient.getQueryData<AccommodationPublic>(accommodationKeys.detail(id));

  return (
    <>
      {room && <AccommodationJsonLd room={room} locale={locale} />}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RoomDetailPage />
      </HydrationBoundary>
    </>
  );
}
