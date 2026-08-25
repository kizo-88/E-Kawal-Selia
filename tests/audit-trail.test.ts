import { describe, expect, it } from "vitest";
import {
  auditColumnHeaders,
  malaysianQuarterRange,
  summarizeAuditForExport,
  type AuditRow,
} from "../src/lib/exports/audit";
import { toMatrix } from "../src/lib/exports/shapes";

describe("malaysianQuarterRange", () => {
  it("maps Q1 to Jan-Mar (to = start of Q2)", () => {
    const { from, to } = malaysianQuarterRange(2026, 1);
    expect(from.getFullYear()).toBe(2026);
    expect(from.getMonth()).toBe(0);
    expect(from.getDate()).toBe(1);
    expect(to.getMonth()).toBe(3);
    expect(to.getDate()).toBe(1);
  });

  it("maps Q4 to Oct-Dec", () => {
    const { from, to } = malaysianQuarterRange(2025, 4);
    expect(from.getMonth()).toBe(9);
    expect(to.getFullYear()).toBe(2026);
    expect(to.getMonth()).toBe(0);
  });
});

describe("auditColumnHeaders", () => {
  it("is fully bilingual", () => {
    expect(auditColumnHeaders.length).toBe(6);
    for (const h of auditColumnHeaders) {
      expect(h.labelMs).toBeTruthy();
      expect(h.labelEn).toBeTruthy();
      expect(typeof h.key).toBe("string");
    }
  });
});

describe("audit export wiring (pure pipeline)", () => {
  it("shapes an audit row into a bilingual matrix", () => {
    const rows: AuditRow[] = [
      {
        actionLabelMs: "Cipta",
        actionLabelEn: "Create",
        userNameSnapshot: "Amin",
        referenceNo: "REF-1",
        moduleCode: "LESEN",
        pageCode: "P1",
        createdAt: new Date("2026-03-04T08:00:00Z"),
      },
    ];
    const matrix = toMatrix(auditColumnHeaders, rows as never, "ms");
    expect(matrix.length).toBe(2);
    expect(matrix[1]).toContain("Cipta");
    expect(matrix[1]).toContain("REF-1");
    expect(summarizeAuditForExport(rows)).toMatch(/1 rekod/);
  });
});
