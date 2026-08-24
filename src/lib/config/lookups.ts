import 'server-only'

import { prisma } from '@/lib/db'

/**
 * The lookup registry — GP-09, and the enforcement surface for G1.
 *
 * Every dropdown in the system resolves through here. Nothing in `src/` should
 * ever contain a literal list of business options; the
 * `kawalselia/no-hardcoded-lists` lint rule will stop it, but the reason it
 * exists is slide 53 of the Garis Panduan: LPKmn takes no responsibility for
 * the cost of tearing out hard-coded work.
 *
 *     const negeri = await getLookupOptions('NEGERI')
 *
 * Adding a value is an admin action in the UI, or a seeder row. It is never a
 * pull request.
 */

export type Locale = 'ms' | 'en'

export interface LookupOption {
  /** Stable code stored in the database. Never display this. */
  value: string
  /** Resolved for the requested locale (G4). */
  label: string
  labelMs: string
  labelEn: string
  metadata: unknown
}

function toOption(
  row: { code: string; labelMs: string; labelEn: string; metadata: unknown },
  locale: Locale,
): LookupOption {
  return {
    value: row.code,
    label: locale === 'en' ? row.labelEn : row.labelMs,
    labelMs: row.labelMs,
    labelEn: row.labelEn,
    metadata: row.metadata,
  }
}

/**
 * Active values for a lookup type, in the admin-defined order.
 *
 * Inactive and soft-deleted values are excluded — but note they are excluded
 * from *selection*, not from *display*. A historical record that references a
 * since-deactivated value must still render its label, which is what
 * `resolveLookupLabel` below is for (G2 / ADR 0003).
 */
export async function getLookupOptions(
  typeCode: string,
  locale: Locale = 'ms',
): Promise<LookupOption[]> {
  const rows = await prisma.lookupValue.findMany({
    where: {
      deletedAt: null,
      active: true,
      lookupType: { code: typeCode, deletedAt: null },
    },
    // eslint-disable-next-line kawalselia/require-bilingual -- a Prisma orderBy clause, not a label pair. Ordering by the Malay label is correct: it is the tie-break for values an admin left at the same sortOrder, and Phase 1 displays Malay.
    orderBy: [{ sortOrder: 'asc' }, { labelMs: 'asc' }],
    select: { code: true, labelMs: true, labelEn: true, metadata: true },
  })

  return rows.map((row) => toOption(row, locale))
}

/**
 * Resolves one code to its label, **including deactivated and soft-deleted
 * values**.
 *
 * This is the G2 half of the registry. When LPKmn deactivates a vessel type,
 * every application that already referenced it must keep rendering the label it
 * was submitted under. Falling back to the raw code would turn a five-year-old
 * approved licence into gibberish in an audit report.
 */
export async function resolveLookupLabel(
  typeCode: string,
  code: string,
  locale: Locale = 'ms',
): Promise<string> {
  const row = await prisma.lookupValue.findFirst({
    where: { code, lookupType: { code: typeCode } },
    select: { labelMs: true, labelEn: true },
  })

  if (!row) return code

  return locale === 'en' ? row.labelEn : row.labelMs
}

/**
 * Whether ordinary users may propose additions to this lookup type.
 *
 * GP-20 lets a user request a new value — a port that is missing from the port
 * list, say — which an admin reviews, may amend, and approves straight into the
 * live list. This flag is what the UI checks before offering that.
 */
export async function allowsUserRequest(typeCode: string): Promise<boolean> {
  const type = await prisma.lookupType.findFirst({
    where: { code: typeCode, deletedAt: null },
    select: { allowUserRequest: true },
  })

  return type?.allowUserRequest ?? false
}
