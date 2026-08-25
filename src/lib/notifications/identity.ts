import type { Prisma } from "@prisma/client";

import { sendNotification } from "./bus";

export interface IdentityUser {
  id: bigint;
  name: string;
  email: string;
}

/**
 * The welcome → verify → finish notification chain (Lane C, Round 4).
 *
 * These are thin wrappers over the bus: they pick the template + category and
 * let sendNotification do preference resolution, rendering, queuing and the
 * PEMBERITAHUAN_DIHANTAR audit row. The templates themselves are seeded rows
 * (data, not code) — a missing template is a seeder gap, not a code bug.
 */

export async function notifyRegistrationWelcome(
  tx: Prisma.TransactionClient,
  user: IdentityUser,
): Promise<void> {
  await sendNotification(tx, {
    userId: user.id,
    userName: user.name,
    templateCode: "PENDAFTARAN_ALUAN",
    category: "pendaftaran",
    vars: { nama: user.name },
  });
}

export async function notifyEmailVerified(
  tx: Prisma.TransactionClient,
  user: IdentityUser,
): Promise<void> {
  await sendNotification(tx, {
    userId: user.id,
    userName: user.name,
    templateCode: "PENDAFTARAN_DISAHKAN",
    category: "pendaftaran",
    vars: { nama: user.name },
  });
}

export async function notifyRegistrationComplete(
  tx: Prisma.TransactionClient,
  user: IdentityUser,
): Promise<void> {
  await sendNotification(tx, {
    userId: user.id,
    userName: user.name,
    templateCode: "PENDAFTARAN_SELESAI",
    category: "pendaftaran",
    vars: { nama: user.name },
  });
}
