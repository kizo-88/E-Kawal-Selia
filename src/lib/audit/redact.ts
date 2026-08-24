/**
 * Redaction for audit diffs — GP-18.
 *
 * Kept separate from `record.ts` because that module is `server-only`, and this
 * logic is pure and needs to be directly testable. Nothing here touches the
 * database or a request.
 */

// eslint-disable-next-line kawalselia/no-hardcoded-lists -- security constant, not a business list. These field names are tied to columns in prisma/schema.prisma; making them admin-editable would let an admin *remove* a field from redaction, which is the opposite of what G1 protects.
const REDACTED = new Set([
  'password',
  'passwordHash',
  'password_hash',
  'mfaSecret',
  'mfa_secret',
  'icNo',
  'ic_no',
  'qrToken',
  'qr_token',
  'token',
  'secret',
])

/**
 * Strips sensitive fields from a change diff before it is recorded.
 *
 * Run both sides of every diff through this. GP-18 wants to know that a
 * password changed; it does not want the password. An audit table is the worst
 * possible place for a secret — widely readable by design, and append-only, so
 * a leak cannot be edited out afterwards.
 */
export function redact(values: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(values)) {
    safe[key] = REDACTED.has(key) ? '[redacted]' : value
  }

  return safe
}
