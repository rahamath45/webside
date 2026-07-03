/** @type {import('next').NextConfig} */
const nextConfig = {
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
