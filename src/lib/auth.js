import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

function getUsers() {
  const filePath = path.join(process.cwd(), 'data', 'users.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        const users = getUsers();
        let user = users.find(
          (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
        );

        if (!user) {
          // Auto-register new user
          const hashedPassword = await bcrypt.hash(credentials.password, 12);
          const newUser = {
            id: String(users.length + 1),
            name: credentials.email.split('@')[0],
            email: credentials.email.toLowerCase(),
            password: hashedPassword,
          };
          users.push(newUser);

          const filePath = path.join(process.cwd(), 'data', 'users.json');
          fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
          user = newUser;
        } else {
          // Verify existing user password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid password');
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
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
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
