/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
        ],
      },
      {
        // Note C: Clear-Site-Data on signout path (Easier to keep in Next.js)
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
