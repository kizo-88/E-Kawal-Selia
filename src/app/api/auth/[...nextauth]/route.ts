import { handlers } from '@/lib/auth/config'

/**
 * Auth.js route handler. GP-03.
 *
 * The decisions live in src/domain/identity/authenticate.ts; this only exposes
 * the endpoints Auth.js needs.
 */
export const { GET, POST } = handlers
