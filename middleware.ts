import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// NOTE: kept as middleware.ts (edge runtime) instead of Next 16's proxy.ts
// because @opennextjs/cloudflare does not support Node.js middleware yet.
// See https://github.com/opennextjs/opennextjs-cloudflare/issues/962
export default createMiddleware(routing);

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(en|zh|ja)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!api|_next|_vercel|.*\\.|favicon.ico).*)'
  ]
};

