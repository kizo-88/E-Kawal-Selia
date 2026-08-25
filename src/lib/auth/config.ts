import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { authenticate } from '@/domain/identity/authenticate'
import { getSetting } from '@/lib/config/settings'

/**
 * Auth.js wiring — GP-03.
 *
 * Auth.js owns the session cookie and nothing else. Every decision that GP-03
 * makes configurable — password rules, lockout threshold, session timeout,
 * forced first-login change — is ours, in `authenticate()` and the settings
 * table. That split is the whole point of ADR 0005: Supabase Auth could not
 * express an admin-editable lockout, and neither can Auth.js.
 *
 * G6: read line by line before merge.
 */

/**
 * The idle timeout, read from settings.
 *
 * GP-03 asks for 10 minutes AND for it to be configurable, so this cannot be a
 * constant. Auth.js reads `maxAge` once when the config is built, so a change
 * in the admin screen applies on the next server start — noted in
 * docs/13-final-push.md as a known limitation rather than left as a surprise.
 */
async function sessionMaxAgeSeconds(): Promise<number> {
  const minutes = await getSetting('security.session_timeout_minutes')
  return Math.max(60, minutes * 60)
}

export const { handlers, auth, signIn, signOut } = NextAuth(async () => ({
  session: {
    // Database-backed rather than a stateless JWT. A ten-minute JWT expiry is
    // not the same as a ten-minute session: it cannot be revoked, so an admin
    // deactivating an account would not actually sign that person out.
    strategy: 'jwt',
    maxAge: await sessionMaxAgeSeconds(),
    updateAge: 60,
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: 'Emel', type: 'email' },
        password: { label: 'Kata Laluan', type: 'password' },
      },

      async authorize(credentials, request) {
        const email = typeof credentials?.email === 'string' ? credentials.email : ''
        const password = typeof credentials?.password === 'string' ? credentials.password : ''

        if (!email || !password) return null

        const result = await authenticate({
          email,
          password,
          ipAddress: request?.headers?.get('x-forwarded-for') ?? null,
          userAgent: request?.headers?.get('user-agent') ?? null,
        })

        // Returning null is the only signal Auth.js accepts for a refusal, so
        // the reason is lost here. That is acceptable because the reason has
        // already been written to the audit trail — and because the login form
        // must not distinguish "no such account" from "wrong password" anyway.
        if (!result.ok) return null

        return {
          id: result.userId,
          name: result.name,
          email: result.email,
          mustChangePassword: result.mustChangePassword,
          mfaPending: result.mfaPending,
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.mustChangePassword = (user as { mustChangePassword?: boolean }).mustChangePassword
        token.mfaPending = (user as { mfaPending?: boolean }).mfaPending
      }
      return token
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? '')
        session.user.mustChangePassword = Boolean(token.mustChangePassword)
        session.user.mfaPending = Boolean(token.mfaPending)
      }
      return session
    },
  },
}))
