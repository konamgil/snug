import type { Metadata } from 'next';
import { AboutPage } from '@/views/about';

type Props = {
  params: Promise<{ locale: string }>;
};

// JSON-LD 구조화된 데이터 컴포넌트
function AboutJsonLd({ locale }: { locale: string }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsnug.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${siteUrl}/${locale}/about`,
    name: 'About SNUG',
    description:
      'SNUG helps foreigners find homes for living in Korea, not just staying. From short stays to flexible rentals with lower deposits and no long-term contracts.',
    url: `${siteUrl}/${locale}/about`,
    mainEntity: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'SNUG',
      alternateName: 'hello, snug.',
      url: siteUrl,
      logo: `${siteUrl}/images/logo/logo.svg`,
      description:
        'Short stays & flexible rentals in Korea for foreigners. Lower deposits, flexible terms, move-in ready homes with multilingual support.',
      slogan: 'Live like a local',
      areaServed: {
        '@type': 'Country',
        name: 'South Korea',
      },
      serviceType: ['Short-term Rentals', 'Flexible Rentals', 'Furnished Apartments'],
      knowsLanguage: ['en', 'ko', 'zh', 'ja', 'vi'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsnug.com';
  const path = '/about';
  const ogImageUrl = `${siteUrl}/images/og_1200x630.png`;

  // Localized content
  const defaultContent = {
    title: 'About SNUG - Live Like a Local in Korea | Short Stays & Flexible Rentals',
    description:
      'SNUG helps foreigners find homes for living in Korea, not just staying. Lower deposits, flexible terms, move-in ready homes with multilingual support.',
  };

  const content: Record<string, { title: string; description: string }> = {
    en: defaultContent,
    ko: {
      title: 'SNUG 소개 - 한국에서 현지인처럼 살기 | 단기 숙소 & 유연한 임대',
      description:
        'SNUG는 외국인들이 한국에서 머무는 것이 아닌 살 수 있는 집을 찾도록 돕습니다. 낮은 보증금, 유연한 계약, 입주 준비 완료된 집과 다국어 지원.',
    },
    zh: {
      title: '关于SNUG - 在韩国像当地人一样生活 | 短租与灵活租赁',
      description:
        'SNUG帮助外国人在韩国找到真正的家，而不仅仅是住所。低押金、灵活条款、拎包入住、多语言支持。',
    },
    ja: {
      title: 'SNUGについて - 韓国でローカルのように暮らす | 短期滞在＆フレキシブル賃貸',
      description:
        'SNUGは外国人が韓国で滞在するだけでなく、住める家を見つけるお手伝いをします。低い保証金、柔軟な契約、入居準備完了の物件、多言語サポート。',
    },
    vi: {
      title: 'Về SNUG - Sống như người bản địa tại Hàn Quốc | Thuê ngắn hạn & linh hoạt',
      description:
        'SNUG giúp người nước ngoài tìm nhà để sống tại Hàn Quốc, không chỉ là nơi ở tạm. Tiền cọc thấp, hợp đồng linh hoạt, nhà sẵn sàng vào ở, hỗ trợ đa ngôn ngữ.',
    },
  };

  const { title, description } = content[locale] ?? defaultContent;

  return {
    title,
    description,
    keywords: [
      'SNUG',
      'Korea rentals',
      'foreigner housing Korea',
      'short-term rentals Seoul',
      'flexible lease Korea',
      'furnished apartments Korea',
      'expat housing Seoul',
      'low deposit rentals',
      'multilingual support',
    ],
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
      siteName: 'hello, snug.',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'SNUG - Live like a local in Korea',
        },
      ],
      locale:
        locale === 'ko'
          ? 'ko_KR'
          : locale === 'zh'
            ? 'zh_CN'
            : locale === 'ja'
              ? 'ja_JP'
              : locale === 'vi'
                ? 'vi_VN'
                : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  return (
    <>
      <AboutJsonLd locale={locale} />
      <AboutPage />
    </>
  );
}
