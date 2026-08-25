/**
 * Reference repository — pure, DB-free core (Lane C, Round 4).
 *
 * The reference backend (GP-style "reference repository": categories, versioned
 * items, admin CRUD, download counts) is fundamentally a Prisma service. That
 * service cannot be written until the `reference_categories` / `reference_items`
 * tables exist in schema.prisma (Lane A territory — see the brief's §9). This
 * module holds the bits that are pure and testable without a database, so the
 * CRUD service can be dropped in around them once the migration lands.
 *
 * G1: a reference item's *kind* is a technical format set (pdf / docx / link),
 * not a business option list, so it is a closed union here rather than a lookup.
 */

export type ReferenceKind = "pdf" | "docx" | "link";

export function isReferenceKind(value: string): value is ReferenceKind {
  return value === "pdf" || value === "docx" || value === "link";
}

/** A reference item version is always monotonic: new version = current + 1. */
export function nextVersion(current: number): number {
  return current + 1;
}

const safe = (segment: string): string => segment.replace(/[^a-zA-Z0-9_-]/g, "_");

/**
 * Deterministic storage path. A reprint or re-send resolves to the same blob,
 * which matters because a reference item is versioned and must be reproducible
 * (ADR 0003 — same reasoning as generated documents).
 */
export function buildStoragePath(
  categoryCode: string,
  code: string,
  version: number,
  ext: string,
): string {
  return `references/${safe(categoryCode)}/${safe(code)}/v${version}.${ext}`;
}

/** Public object key for a Supabase Storage download. */
export function publicObjectKey(bucket: string, path: string): string {
  return `${bucket}/${path}`;
}
