import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { verifyPassword } from '@/lib/password';
import pool from '@/lib/db';
import crypto from 'crypto';
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
        token.jti = crypto.randomUUID();
        token.totp_enabled = user.totp_enabled;
      }

      // Finding 7: Check database blacklist for revoked tokens
      if (token.jti) {
        try {
          const { rowCount } = await pool.query(
            'SELECT 1 FROM token_blacklist WHERE jti = $1',
            [token.jti]
          );
          if (rowCount > 0) {
            return {}; // Token is revoked!
          }
        } catch (err) {
          console.error('Failed to check token blacklist', err);
        }
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
    // Finding 7: Blacklist session on signout (persisted to PostgreSQL)
    async signOut({ token }) {
      if (token && token.jti) {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        try {
          await pool.query(
            'INSERT INTO token_blacklist (jti, expires_at) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [token.jti, expiresAt]
          );
        } catch (err) {
          console.error('Failed to blacklist token', err);
        }
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
