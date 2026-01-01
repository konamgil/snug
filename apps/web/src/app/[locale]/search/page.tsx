import type { Metadata } from 'next';
import { SearchPage } from '@/views/search';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const search = await searchParams;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsnug.com';
  const location = search.location || '';

  // 동적 타이틀/설명
  const title = location
    ? `Accommodations in ${location} | Snug`
    : 'Search Accommodations in Korea | Snug';

  const description = location
    ? `Find your perfect home in ${location}. Apartments, share houses, and rooms for foreigners in Korea.`
    : 'Search and find your perfect accommodation in Korea. Apartments, share houses, and rooms for foreigners.';

  // Canonical URL (정렬 파라미터 제외)
  const canonicalParams = new URLSearchParams();
  if (search.location) canonicalParams.set('location', search.location);
  if (search.checkIn) canonicalParams.set('checkIn', search.checkIn);
  if (search.checkOut) canonicalParams.set('checkOut', search.checkOut);
  if (search.guests) canonicalParams.set('guests', search.guests);

  const queryString = canonicalParams.toString();
  const path = `/search${queryString ? `?${queryString}` : ''}`;

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
    },
  };
}

export default function SearchRoute() {
  return <SearchPage />;
}
