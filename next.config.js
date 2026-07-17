/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Server',
            value: 'web',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            // Finding 4: Strengthened CSP — removed unsafe-eval, segmented directives
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https:",
              "frame-ancestors 'self'",
              "form-action 'self'",
              "base-uri 'self'",
            ].join('; ') + ';',
          },
          {
            // Note D: CSP Report-Only for monitoring — tighter than enforcement policy
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https:",
            ].join('; ') + ';',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            // Note B: Cache-Control — prevent caching of sensitive pages
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        // Note C: Clear-Site-Data on signout path
        source: '/api/auth/signout',
        headers: [
          {
            key: 'Clear-Site-Data',
            value: '"cache", "cookies", "storage"',
          },
        ],
      },
    ];
  },
  env: {
    GOOGLE_FORM_URL: process.env.GOOGLE_FORM_URL,
    GOOGLE_FORM_EMAIL_ENTRY: process.env.GOOGLE_FORM_EMAIL_ENTRY,
  },
  // Allow PDFKit to work in API routes (needs native fs access for font files)
  experimental: {
    serverComponentsExternalPackages: ['pdfkit'],
  },
};

module.exports = nextConfig;
