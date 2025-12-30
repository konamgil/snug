import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/config';
import { Providers } from '../providers';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const metadata = messages.metadata as { title: string; description: string };

  const siteUrl = 'https://www.findsnug.com';
  const ogImageUrl = `${siteUrl}/images/og_1200x630.png`;

  return {
    title: metadata.title,
    description: metadata.description,
    icons: {
      icon: '/images/logo/favicon.svg',
      apple: '/apple-touch-icon.png',
    },
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        en: `${siteUrl}/en`,
        ko: `${siteUrl}/ko`,
        zh: `${siteUrl}/zh`,
        ja: `${siteUrl}/ja`,
        vi: `${siteUrl}/vi`,
        'x-default': `${siteUrl}/en`,
      },
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: siteUrl,
      siteName: 'hello, snug.',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'hello, snug.',
        },
      ],
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: [ogImageUrl],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(locales, locale)) {
    notFound();
  }

  setRequestLocale(locale as Locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  );
}
