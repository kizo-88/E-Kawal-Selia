import { describe, expect, it } from "vitest";

import {
  buildStoragePath,
  isReferenceKind,
  nextVersion,
  publicObjectKey,
} from "../src/lib/references/logic";

describe("reference repository — pure core", () => {
  it("classifies reference kinds", () => {
    expect(isReferenceKind("pdf")).toBe(true);
    expect(isReferenceKind("docx")).toBe(true);
    expect(isReferenceKind("link")).toBe(true);
    expect(isReferenceKind("exe")).toBe(false);
  });

  it("bumps version monotonically", () => {
    expect(nextVersion(3)).toBe(4);
  });

  it("builds a deterministic, sanitised storage path", () => {
    expect(buildStoragePath("BORANG", "LPK/1", 2, "pdf")).toBe(
      "references/BORANG/LPK_1/v2.pdf",
    );
  });

  it("forms the public object key", () => {
    expect(publicObjectKey("rujukan", "references/BORANG/LPK_1/v2.pdf")).toBe(
      "rujukan/references/BORANG/LPK_1/v2.pdf",
    );
  });
});
