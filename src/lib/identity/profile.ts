/**
 * Profile management — Lane C, Round 4.
 *
 * Lets a user maintain their own non-sensitive profile fields. Deliberately
 * does NOT touch email, password or IC — those are auth-owned (src/lib/auth)
 * and gated by verification flows. This keeps the auth surface untouched while
 * still giving Lane C a real profile write path.
 */

import type { Prisma } from "@prisma/client";

export interface ProfilePatch {
  name?: string;
  phone?: string | null;
  preferredLocale?: string;
  profilePhotoPath?: string | null;
}

// These are User table column names that updateProfile may write — not a
// business option list (dropdown/status/role), so G1 does not apply. Listed
// explicitly so a future edit cannot silently start writing email/password/ic.
// eslint-disable-next-line kawalselia/no-hardcoded-lists -- column names, not a business enumeration
const WRITABLE: Array<keyof ProfilePatch> = [
  "name",
  "phone",
  "preferredLocale",
  "profilePhotoPath",
];

export async function updateProfile(
  tx: Prisma.TransactionClient,
  userId: bigint,
  patch: ProfilePatch,
): Promise<void> {
  const data: Record<string, unknown> = {};
  for (const key of WRITABLE) {
    if (patch[key] !== undefined) data[key] = patch[key];
  }
  if (Object.keys(data).length === 0) return;
  await tx.user.update({ where: { id: userId }, data });
}

/** Duplicate-account guard for registration. Read-only; never writes. */
export async function isEmailTaken(
  tx: Prisma.TransactionClient,
  email: string,
  exceptUserId?: bigint,
): Promise<boolean> {
  const existing = await tx.user.findFirst({
    where: {
      email,
      deletedAt: null,
      ...(exceptUserId ? { NOT: { id: exceptUserId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}
