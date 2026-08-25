import 'next-auth'

/**
 * GP-03 adds two facts to the session that the UI must act on before letting
 * the user do anything else: a forced password change on first login, and an
 * outstanding MFA challenge.
 */
declare module 'next-auth' {
  interface User {
    mustChangePassword?: boolean
    mfaPending?: boolean
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      mustChangePassword: boolean
      mfaPending: boolean
    }
  }
}
