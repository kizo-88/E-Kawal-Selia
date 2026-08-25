import { describe, expect, it } from "vitest";
import type { Prisma } from "@prisma/client";

import { acceptUndertaking } from "../src/lib/identity/undertaking";
import { updateProfile, isEmailTaken } from "../src/lib/identity/profile";
import {
  requestLookupValue,
  reviewLookupRequest,
} from "../src/lib/identity/change-request";
import { notifyRegistrationWelcome } from "../src/lib/notifications/identity";

function baseTx(over: Record<string, unknown>): Prisma.TransactionClient {
  const def: Record<string, unknown> = {
    userUndertaking: { create: async (a: { data: Record<string, unknown> }) => ({ id: 1n, ...a.data }) },
    auditLog: { create: async () => ({}) },
    user: { update: async (a: { data: Record<string, unknown> }) => a.data, findFirst: async () => null, findUnique: async () => null },
    lookupType: { findFirst: async () => null },
    lookupValue: {
      create: async (a: { data: Record<string, unknown> }) => ({ id: 1n, ...a.data }),
      findUnique: async () => null,
      findMany: async () => [],
      update: async (a: { data: Record<string, unknown> }) => a.data,
    },
    notificationTemplate: { findUnique: async () => ({ code: "X", subjectMs: "s", subjectEn: "s", bodyMs: "b", bodyEn: "b" }) },
    userRole: { findMany: async () => [] },
    notificationPreference: { findFirst: async () => null, findMany: async () => [] },
    notificationMessage: { create: async () => ({ id: 1n }), update: async () => ({}) },
    userInternalUnit: { findMany: async () => [] },
  };
  return { ...def, ...over } as unknown as Prisma.TransactionClient;
}

describe("Aku-Janji acceptance (GP-06)", () => {
  it("snapshots the version and writes the audit row", async () => {
    const audits: Array<Record<string, unknown>> = [];
    const tx = baseTx({ auditLog: { create: async (a: { data: Record<string, unknown> }) => { audits.push(a.data); return {}; } } });
    const id = await acceptUndertaking(tx, {
      userId: 9n,
      undertakingVersionId: 4n,
      version: "2026.1",
    });
    expect(id).toBe(1n);
    expect(audits[0].actionCode).toBe("AKU_JANJI_DITERIMA");
  });
});

describe("profile management", () => {
  it("isEmailTaken reflects an existing account", async () => {
    const tx = baseTx({ user: { update: async () => ({}), findFirst: async () => ({ id: 2n }), findUnique: async () => null } });
    expect(await isEmailTaken(tx, "a@b.test")).toBe(true);

    const tx2 = baseTx({ user: { update: async () => ({}), findFirst: async () => null, findUnique: async () => null } });
    expect(await isEmailTaken(tx2, "c@d.test")).toBe(false);
  });

  it("never writes email/password/ic — only whitelisted fields", async () => {
    const written: Record<string, unknown> = {};
    const tx = baseTx({ user: { update: async (a: { data: Record<string, unknown> }) => { Object.assign(written, a.data); return a.data; }, findFirst: async () => null, findUnique: async () => null } });
    await updateProfile(tx, 1n, { name: "Amin", email: "hack@x.test", passwordHash: "nope" } as never);
    expect(written.name).toBe("Amin");
    expect(written.email).toBeUndefined();
    expect(written.passwordHash).toBeUndefined();
  });
});

describe("change request form (GP-20)", () => {
  it("rejects a request when the lookup type disallows user requests", async () => {
    const tx = baseTx({ lookupType: { findFirst: async () => ({ id: 1n, allowUserRequest: false }) } });
    await expect(
      requestLookupValue(tx, { userId: 1n, lookupTypeCode: "NEGERI", code: "XYZ", labelMs: "X", labelEn: "X" }),
    ).rejects.toThrow();
  });

  it("creates a hidden pending value and approves it into the live list", async () => {
    const created: Record<string, unknown> = {};
    const audits: Array<Record<string, unknown>> = [];
    const tx = baseTx({
      lookupType: { findFirst: async () => ({ id: 1n, allowUserRequest: true }) },
      lookupValue: {
        create: async (a: { data: Record<string, unknown> }) => { Object.assign(created, a.data); return { id: 7n, ...a.data }; },
        findUnique: async () => ({ id: 7n, labelMs: "Pelabuhan X", labelEn: "Port X", code: "PX" }),
        findMany: async () => [],
        update: async (a: { data: Record<string, unknown> }) => a.data,
      },
      auditLog: { create: async (a: { data: Record<string, unknown> }) => { audits.push(a.data); return {}; } },
    });

    const id = await requestLookupValue(tx, { userId: 1n, lookupTypeCode: "NEGERI", code: "PX", labelMs: "Pelabuhan X", labelEn: "Port X" });
    expect(id).toBe(7n);
    expect(created.active).toBe(false);
    expect(created.createdVia).toBe("change_request");

    await reviewLookupRequest(tx, { lookupValueId: 7n, actorUserId: 2n, approve: true });
    expect(audits[0].actionCode).toBe("SENARAI_PILIHAN_DITAMBAH");
  });

  it("soft-deletes a rejected request", async () => {
    const updated: Record<string, unknown> = {};
    const tx = baseTx({
      lookupValue: {
        create: async (a: { data: Record<string, unknown> }) => ({ id: 7n, ...a.data }),
        findUnique: async () => ({ id: 7n, labelMs: "X", labelEn: "X", code: "X" }),
        findMany: async () => [],
        update: async (a: { data: Record<string, unknown> }) => { Object.assign(updated, a.data); return a.data; },
      },
    });
    await reviewLookupRequest(tx, { lookupValueId: 7n, actorUserId: 2n, approve: false });
    expect(updated.deletedAt).toBeDefined();
  });
});

describe("registration notification chain", () => {
  it("fires the welcome notice through the bus", async () => {
    const messages: Array<Record<string, unknown>> = [];
    const tx = baseTx({
      notificationMessage: { create: async (a: { data: Record<string, unknown> }) => { messages.push(a.data); return { id: 1n }; }, update: async () => ({}) },
    });
    await notifyRegistrationWelcome(tx, { id: 1n, name: "Amin", email: "a@b.test" });
    expect(messages.some((m) => m.channel === "inapp")).toBe(true);
  });
});
