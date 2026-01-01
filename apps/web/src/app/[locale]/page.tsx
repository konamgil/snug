// Home page route
import { setRequestLocale } from 'next-intl/server';
import { HomePage } from '@/views/home';
import { type Locale } from '@/i18n/config';

type Props = {
  params: Promise<{ locale: string }>;
};

// Organization JSON-LD for search engines
function OrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsnug.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'Snug',
    alternateName: 'FindSnug',
    url: siteUrl,
    logo: `${siteUrl}/images/logo/logo.svg`,
    description:
      'Find your perfect home in Korea. Apartments, share houses, and rooms for foreigners.',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Korean', 'Chinese', 'Japanese', 'Vietnamese'],
    },
    areaServed: {
      '@type': 'Country',
      name: 'South Korea',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// WebSite JSON-LD for search box in Google
function WebSiteJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findsnug.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: 'Snug',
    description: 'Find accommodations in Korea for foreigners',
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/en/search?location={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <HomePage />
    </>
  );
}
