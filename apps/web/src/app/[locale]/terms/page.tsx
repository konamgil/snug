import { setRequestLocale } from 'next-intl/server';
import { TermsPage } from '@/views/terms';
import { type Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <TermsPage />;
}
