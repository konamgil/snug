// Root layout - minimal wrapper for locale routing
// The actual layout with full styling is in [locale]/layout.tsx

import type { Viewport } from 'next';
import { ViewTransitions } from 'next-view-transitions';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransitions>
      <html suppressHydrationWarning>
        <head>
          <link rel="icon" href="/images/logo/favicon.svg" type="image/svg+xml" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />
          {/* Wanted Sans - English/Numbers */}
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css"
          />
          {/* Pretendard - Korean */}
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          />
        </head>
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ViewTransitions>
  );
}
