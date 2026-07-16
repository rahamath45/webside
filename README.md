This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

docker exec -it webside_db psql -U webside_user -d webside -c "SELECT * FROM users;"

## Security Hardening (Findings 1-17 Resolved)

The application has been fully secured against all 17 findings from the recent Security Audit:

### Authentication & Sessions
- **Finding 1 & 2**: Strict password complexity (8+ chars) & RFC 5322 email validation.
- **Finding 3 & 4**: IP-based and User-based Rate Limiting implemented on all endpoints.
- **Finding 16**: Database migrated from sequential IDs to UUIDs (IDOR prevention).

### Data & Input Validation
- **Finding 7**: Stored XSS prevented using `stripHtml` on all inputs.
- **Finding 8 & 12**: Strict type checks prevent NoSQL/Type Confusion (400 Bad Request).
- **Finding 9 & 10**: Maximum length constraints and mandatory fields enforced.
- **Finding 13 & 14**: Strict `application/json` Content-Type validation and Mass Assignment whitelist protection.

### Information Disclosure & Logic
- **Finding 5**: Internal fields (like `adminEmail`) and 500 stack traces removed from API responses.
- **Finding 6**: Mutex locks and DB unique constraints added to prevent race conditions & duplicates.
- **Finding 11**: User enumeration prevented (generic success messages for existing & new emails).
- **Finding 15 & 17**: COOP, COEP, CORP, CSP headers hardened; Next.js server disclosure removed.
