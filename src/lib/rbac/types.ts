/**
 * RBAC — shared types for the roles and permissions service (GP-01, GP-02).
 *
 * The five baseline roles are data (`is_system = true`), not code. This module
 * knows nothing about which codes exist: GP-02 requires unlimited further roles
 * to be creatable, so anything that assumed a fixed set of codes would be a
 * bug. Every decision here reads the `isSystem` flag off the record.
 */

export interface RoleDraft {
  /** SCREAMING_SNAKE, e.g. PENTADBIR_SISTEM. Unique, admin-defined. */
  code: string
  /** Bilingual display name (G4). */
  nameMs: string
  nameEn: string
  description?: string | null
  sortOrder?: number
}

/** A persisted role, as the service returns it. */
export interface RoleRecord {
  id: bigint
  code: string
  nameMs: string
  nameEn: string
  description: string | null
  isSystem: boolean
  active: boolean
  sortOrder: number
  deletedAt: Date | null
}

/**
 * A field-level validation failure, bilingual so the admin screen can show it
 * in the operator's language (G4). Phase 1 displays Malay; the English must
 * exist.
 */
export interface FieldError {
  field: string
  messageMs: string
  messageEn: string
}

export type RoleResult = { ok: true; role: RoleRecord } | { ok: false; errors: FieldError[] }

/** The outcome of attempting to archive (soft-delete) a role. */
export type ArchiveResult =
  | { ok: true }
  | { ok: false; reason: 'NOT_FOUND' | 'IS_SYSTEM'; reasonMs: string; reasonEn: string }
