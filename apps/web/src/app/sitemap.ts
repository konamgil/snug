import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.findsnug.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.findsnug.com';
const locales = ['en', 'ko', 'zh', 'ja', 'vi'];

async function getAccommodations() {
  try {
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

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
  );

  // 2. 동적 페이지 (숙소 상세)
  const roomEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    accommodations.map((room: { id: string; updatedAt?: string }) => ({
      url: `${baseUrl}/${locale}/room/${room.id}`,
      lastModified: room.updatedAt ? new Date(room.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  );

  return [...staticEntries, ...roomEntries];
}
