// Note: This middleware is only active in non-static export mode.
// When using `output: 'export'`, middleware is not supported.
// For static export, locale detection is handled client-side.

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - Static files
    // - _next (Next.js internals)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
