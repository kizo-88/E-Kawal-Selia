import bcrypt from 'bcryptjs'

/**
 * Password hashing — GP-03.
 *
 * "Katalaluan mestilah dikonfigurasi secara selamat... dengan tidak menyimpan
 *  di dalam bentuk text. Menetapkan algoritma hashing seperti Bcrypt."
 *
 * DECISION (ADR 0005 flagged this for task 3.1): **bcryptjs, cost 12.**
 *
 * Argon2id is the stronger algorithm and would be the default choice on a
 * bigger team. It is rejected here for one practical reason: the Node argon2
 * bindings need node-gyp, and this team is three interns and a WBL student on
 * Windows machines with no ops capacity to spend on native build failures. A
 * hashing algorithm nobody can install is worse than a good one everybody can.
 *
 * bcryptjs is pure JavaScript, so it installs everywhere and deploys anywhere.
 * Cost 12 is the RULES.md value and the Garis Panduan names bcrypt explicitly.
 *
 * GP-03 also requires the method to be UPGRADEABLE. bcrypt hashes carry their
 * cost in the string, so raising the cost later re-hashes on next sign-in
 * without a migration — see `needsRehash` below.
 *
 * G6: read line by line before merge.
 */

/** Raise this to strengthen hashing; existing users upgrade on next sign-in. */
export const BCRYPT_COST = 12

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST)
}

/**
 * Verifies a password against a stored hash.
 *
 * bcrypt's compare is constant-time with respect to the hash contents, which is
 * why this must never be replaced with a string equality check on a
 * re-computed hash.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return false

  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    // A malformed hash in the database must read as "wrong password", never as
    // an exception that a caller might treat as a pass.
    return false
  }
}

/**
 * Whether a stored hash was made with a weaker cost than we now use.
 *
 * Call this after a successful sign-in — that is the only moment the plaintext
 * is available to re-hash with. This is what makes GP-03's "pengemaskinian
 * method keselamatan terkini" true in practice rather than in principle.
 */
export function needsRehash(hash: string): boolean {
  try {
    return bcrypt.getRounds(hash) < BCRYPT_COST
  } catch {
    // Unparseable means it did not come from a current bcrypt — rehash it.
    return true
  }
}
