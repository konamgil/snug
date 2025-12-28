// Home page route
import { setRequestLocale } from 'next-intl/server';
import { HomePage } from '@/views/home';
import { type Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      {/* Preload hero banner video for faster loading */}
      <link rel="preload" href="/images/banner/live-banner.mp4" as="video" type="video/mp4" />
      <HomePage />
    </>
  );
}
