import { describe, expect, it } from "vitest";

import { assembleDocument } from "../src/lib/documents/render";
import { generateDocument } from "../src/lib/documents/engine";

describe("document rendering (pure)", () => {
  it("interpolates header, body and footer", () => {
    const html = assembleDocument(
      {
        headerHtml: "<h1>{{tajuk}}</h1>",
        bodyHtml: "<p>{{nama}}</p>",
        footerHtml: "<small>{{copyright}}</small>",
      },
      { tajuk: "Lesen", nama: "Amin", copyright: "LPKmn" },
    );
    expect(html).toContain("<h1>Lesen</h1>");
    expect(html).toContain("<p>Amin</p>");
    expect(html).toContain("<small>LPKmn</small>");
  });

  it("renders the Malay disclaimer by default", () => {
    const html = assembleDocument(
      { headerHtml: null, bodyHtml: "<p>x</p>", footerHtml: null, disclaimerMs: "Rahsia", disclaimerEn: "Secret" },
      {},
    );
    expect(html).toContain("Rahsia");
    expect(html).not.toContain("Secret");
  });

  it("carries paper size and orientation", () => {
    const html = assembleDocument({ headerHtml: null, bodyHtml: "<p>x</p>", footerHtml: null }, {}, { paperSize: "A3", orientation: "landscape" });
    expect(html).toContain("size: A3 landscape");
  });
});

function fakeDocTx(overrides: Record<string, unknown> = {}) {
  const store = { docs: [] as Array<Record<string, unknown>>, audits: [] as Array<Record<string, unknown>> };
  const tx: Record<string, unknown> = {
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
        ...(overrides.template as object),
      }),
    },
    generatedDocument: {
      create: async (a: { data: Record<string, unknown> }) => {
        store.docs.push(a.data);
        return { id: 1n, ...a.data };
      },
    },
    auditLog: { create: async (a: { data: Record<string, unknown> }) => { store.audits.push(a.data); return {}; } },
  };
  return { tx: tx as never, store };
}

describe("document engine — generateDocument", () => {
  it("snapshots the template version and emits a 32-char random qr token", async () => {
    const { tx, store } = fakeDocTx();
    const result = await generateDocument(tx as never, {
      templateCode: "LESEN",
      referenceNo: "LPK/LPS/2026/00123",
      vars: { nama: "Amin", rujukan: "LPK/LPS/2026/00123" },
      generatedBy: 7n,
    });
    expect(result.version).toBe(3);
    expect(result.qrToken).toHaveLength(32);
    expect(store.docs[0].templateVersion).toBe(3);
    expect(store.audits[0].actionCode).toBe("DOKUMEN_DIJANA");
    expect(store.audits[0].referenceNo).toBe("LPK/LPS/2026/00123");
  });
});
