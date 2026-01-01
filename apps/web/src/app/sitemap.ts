import type { MetadataRoute } from 'next';

// 빌드 시 API 없이도 생성 가능하도록 동적 생성
export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsnug.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.findsnug.com';
const locales = ['en', 'ko', 'zh', 'ja', 'vi'];

async function getAccommodations() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    const res = await fetch(`${apiUrl}/accommodations/public?limit=100`, {
      next: { revalidate: 3600 }, // 1시간 캐시
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Sitemap fetch failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    const accommodations = data.data?.data || data.data || [];
    console.log(`Sitemap: fetched ${accommodations.length} accommodations`);
    return accommodations;
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
