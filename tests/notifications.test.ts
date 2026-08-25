import { describe, expect, it } from "vitest";
import type { Prisma } from "@prisma/client";

import { renderNotification, interpolate } from "../src/lib/notifications/render";
import { channelEnabled } from "../src/lib/notifications/preferences";
import { sendNotification } from "../src/lib/notifications/bus";

describe("notification rendering", () => {
  it("interpolates variables", () => {
    expect(interpolate("Helo {{ nama }}!", { nama: "Amin" })).toBe("Helo Amin!");
  });

  it("renders the Malay body by default and English when asked", () => {
    const tpl = {
      subjectMs: "Subjek {{kod}}",
      subjectEn: "Subject {{kod}}",
      bodyMs: "Badan BM {{kod}}",
      bodyEn: "Body EN {{kod}}",
      locale: "ms" as const,
      vars: { kod: "LPS/1" },
    };
    const ms = renderNotification(tpl);
    const en = renderNotification({ ...tpl, locale: "en" });
    expect(ms.body).toBe("Badan BM LPS/1");
    expect(en.body).toBe("Body EN LPS/1");
    expect(en.title).toBe("Subject LPS/1");
  });
});

describe("channel resolution (GP-16)", () => {
  it("disables a channel when the user opts out", () => {
    expect(channelEnabled({ channel: "email", userEnabled: false, roleEnabled: [] })).toBe(false);
  });

  it("keeps a channel on when the user has no preference", () => {
    expect(channelEnabled({ channel: "email", userEnabled: null, roleEnabled: [] })).toBe(true);
  });

  it("disables when every role preference is off", () => {
    expect(channelEnabled({ channel: "email", userEnabled: true, roleEnabled: [false, false] })).toBe(false);
  });

  it("keeps a channel on when at least one role preference is on", () => {
    expect(channelEnabled({ channel: "email", userEnabled: true, roleEnabled: [false, true] })).toBe(true);
  });
});

function fakeTx(overrides: Record<string, unknown> = {}) {
  const store = { messages: [] as Array<Record<string, unknown>>, audits: [] as Array<Record<string, unknown>> };
  const tx: Record<string, unknown> = {
    notificationTemplate: {
      findUnique: async () => ({
        code: "T",
        subjectMs: "Subjek {{nama}}",
        subjectEn: "Subject {{nama}}",
        bodyMs: "BM {{nama}}",
        bodyEn: "EN {{nama}}",
        ...(overrides.template as object),
      }),
    },
    user: {
      findUnique: async () => overrides.user ?? { preferredLocale: "ms", name: "Amin", email: "amin@x.test" },
    },
    userRole: { findMany: async () => overrides.userRoles ?? [] },
    notificationPreference: {
      findFirst: async () => overrides.userPref ?? null,
      findMany: async () => overrides.rolePrefs ?? [],
    },
    notificationMessage: {
      create: async (a: { data: Record<string, unknown> }) => {
        store.messages.push(a.data);
        return { id: BigInt(store.messages.length) };
      },
      update: async () => ({}),
    },
    auditLog: { create: async (a: { data: Record<string, unknown> }) => { store.audits.push(a.data); return {}; } },
    userInternalUnit: { findMany: async () => [] },
  };
  return { tx: tx as unknown as Prisma.TransactionClient, store };
}

describe("notification bus — sendNotification", () => {
  it("sends in-app + email and writes the audit row (happy path)", async () => {
    const { tx, store } = fakeTx();
    const result = await sendNotification(tx, {
      userId: 1n,
      templateCode: "T",
      category: "semakan",
      vars: { nama: "Amin" },
    });
    expect(result.channels).toEqual(["inapp", "email"]);
    expect(store.messages).toHaveLength(2);
    expect(store.messages.map((m) => m.channel).sort()).toEqual(["email", "inapp"]);
    expect(store.audits).toHaveLength(1);
    expect(store.audits[0].actionCode).toBe("PEMBERITAHUAN_DIHANTAR");
  });

  it("drops email when the user opts out (permission-denied path)", async () => {
    const { tx, store } = fakeTx({ userPref: { enabled: false } });
    const result = await sendNotification(tx, {
      userId: 1n,
      templateCode: "T",
      category: "semakan",
      vars: { nama: "Amin" },
    });
    expect(result.channels).toEqual(["inapp"]);
    expect(store.messages).toHaveLength(1);
    expect(store.messages[0].channel).toBe("inapp");
    expect(store.audits[0].actionCode).toBe("PEMBERITAHUAN_DIHANTAR");
  });
});
