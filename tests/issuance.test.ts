import { describe, expect, it } from "vitest";

import { issueLicence, resolveLicenceVerification } from "../src/lib/documents/issuance";

interface FakeStore {
  audits: Array<Record<string, unknown>>;
}

function fakeTx(opts: {
  existingDoc?: Record<string, unknown> | null;
  existingLicence?: Record<string, unknown> | null;
} = {}): { tx: never; store: FakeStore } {
  const store: FakeStore = { audits: [] };
  const tx: Record<string, unknown> = {
    licence: {
      create: async (a: { data: Record<string, unknown> }) => ({ id: 42n, ...a.data }),
      update: async (a: { data: Record<string, unknown> }) => ({ id: 42n, ...a.data }),
      findFirst: async () => opts.existingLicence ?? null,
    },
    documentTemplate: {
      findUnique: async () => ({
        code: "LESEN",
        nameMs: "Lesen Perkhidmatan Sokongan",
        nameEn: "Supporting Service Licence",
        headerHtml: "<h1>{{nama}}</h1>",
        bodyHtml: "<p>{{rujukan}}</p>",
        footerHtml: null,
        disclaimerMs: "Rahsia Rasmi",
        disclaimerEn: null,
        version: 3,
        paperSize: "A4",
        orientation: "portrait",
      }),
    },
    generatedDocument: {
      create: async (a: { data: Record<string, unknown> }) => ({ id: 7n, ...a.data }),
      findUnique: async () => opts.existingDoc ?? null,
    },
    auditLog: {
      create: async (a: { data: Record<string, unknown> }) => {
        store.audits.push(a.data);
        return {};
      },
    },
  };
  return { tx: tx as never, store };
}

const QR_ALPHABET = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz]{32}$/;

describe("issueLicence", () => {
  it("creates a licence linked to a generated document with a domain qr token", async () => {
    const { tx } = fakeTx({});
    const res = await issueLicence(tx, {
      applicationId: 1n,
      applicationTypeId: 2n,
      licenceNo: "LPK/LPS/2026/00123",
      holderUserId: 9n,
      holderNameSnapshot: "Syarikat Amin Sdn Bhd",
      templateCode: "LESEN",
      templateVars: { nama: "Amin", rujukan: "LPK/LPS/2026/00123" },
      validFrom: new Date("2026-01-01"),
      validUntil: new Date("2026-12-31"),
      issuedBy: 7n,
    });
    expect(res.licenceId).toBe(42n);
    expect(res.generatedDocumentId).toBe(7n);
    expect(res.qrToken).toHaveLength(32);
    expect(res.qrToken).toMatch(QR_ALPHABET);
  });

  it("writes a specific LESEN_DIKELUARKAN audit row, not a bare update (G3)", async () => {
    const { tx, store } = fakeTx({});
    await issueLicence(tx, {
      applicationId: 1n,
      applicationTypeId: 2n,
      licenceNo: "LPK/LPS/2026/00123",
      holderUserId: 9n,
      holderNameSnapshot: "Syarikat Amin Sdn Bhd",
      templateCode: "LESEN",
      templateVars: {},
      validFrom: new Date("2026-01-01"),
      validUntil: new Date("2026-12-31"),
      issuedBy: 7n,
    });
    const issued = store.audits.find((a) => a.actionCode === "LESEN_DIKELUARKAN");
    expect(issued).toBeDefined();
    expect(String(issued!.actionLabelMs)).toContain("LPK/LPS/2026/00123");
  });
});

describe("resolveLicenceVerification (public /semak)", () => {
  it("returns not found when no document matches the token", async () => {
    const { tx } = fakeTx({ existingDoc: null });
    const res = await resolveLicenceVerification(tx, "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz");
    expect(res.found).toBe(false);
  });

  it("resolves a real licence into the minimal public payload only (X-R12)", async () => {
    const doc = { id: 7n, deletedAt: null, revokedAt: null };
    const licence = {
      licenceNo: "LPK/LPS/2026/00123",
      holderNameSnapshot: "Syarikat Amin Sdn Bhd",
      status: "active",
      issuedAt: new Date("2026-01-01"),
      validFrom: new Date("2026-01-01"),
      validUntil: new Date("2026-12-31"),
      revokedAt: null,
      applicationType: {
        nameMs: "Lesen Perkhidmatan Sokongan",
        nameEn: "Supporting Service Licence",
      },
    };
    const { tx } = fakeTx({ existingDoc: doc, existingLicence: licence });
    const res = await resolveLicenceVerification(tx, "ABCDEFGHJKMNPQRSTUVWXYZ23456789ab");
    expect(res.found).toBe(true);
    expect(res.verification?.licenceNo).toBe("LPK/LPS/2026/00123");
    expect(res.verification?.typeMs).toBe("Lesen Perkhidmatan Sokongan");
    expect(res.verification?.holderName).toBe("Syarikat Amin Sdn Bhd");
    // The disclosure boundary: no IC / address / phone leaks into the payload.
    expect("holderIcNo" in (res.verification ?? {})).toBe(false);
  });
});
