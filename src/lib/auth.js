import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { verifyPassword } from '@/lib/password';
import pool from '@/lib/db';
import { sessionBlacklist, generateJti } from '@/lib/token-blacklist';
import * as OTPAuth from 'otpauth';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: 'Authentication Code', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        // Finding 4: Trim and canonicalize email on login
        const normalizedEmail = credentials.email.trim().toLowerCase();

        const { rows } = await pool.query(
          'SELECT id, name, email, password, email_verified, totp_enabled, totp_secret FROM users WHERE email = $1',
          [normalizedEmail]
        );

        const user = rows[0];

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        // Finding 9: Enforce email verification
        if (!user.email_verified) {
          throw new Error('Please verify your email before signing in');
        }

        // Finding 3: Enforce TOTP MFA if enabled
        if (user.totp_enabled) {
          if (!credentials.totpCode) {
            throw new Error('TOTP_REQUIRED');
          }

          const totp = new OTPAuth.TOTP({
            issuer: 'Registry Portal',
            label: user.email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(user.totp_secret),
          });

          const delta = totp.validate({ token: credentials.totpCode, window: 1 });
          if (delta === null) {
            throw new Error('Invalid authentication code');
          }
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          totp_enabled: user.totp_enabled
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Setup JTI on initial sign in
      if (user) {
        token.id = user.id;
        token.jti = generateJti();
        token.totp_enabled = user.totp_enabled;
      }

      // Finding 7: Check token blacklist
      if (token.jti && sessionBlacklist.isBlacklisted(token.jti)) {
        // Token is revoked
        return {};
      }

      return token;
    },
    async session({ session, token }) {
      if (!token || !token.id) {
        // Token was revoked or invalid
        session.user = null;
        return session;
      }
      
      session.user.id = token.id;
      session.user.totp_enabled = token.totp_enabled;
      return session;
    },
  },
  events: {
    // Finding 7: Blacklist session on signout
    async signOut({ token }) {
      if (token && token.jti) {
        // Add to blacklist with 24h expiry
        sessionBlacklist.add(token.jti, Date.now() + 24 * 60 * 60 * 1000);
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
