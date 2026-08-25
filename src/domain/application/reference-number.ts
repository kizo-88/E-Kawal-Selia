/**
 * Reference numbers — M1-R05.
 *
 * "penjanaan nombor rujukan atau nombor siri permohonan secara automatik"
 *
 * Format: LPK/{TYPE}/{YEAR}/{SEQ}, e.g. LPK/LPS/2026/00123
 *
 * The sequence restarts each year and is per type, which is how LPKmn's paper
 * files are already numbered — matching it matters, because officers will be
 * cross-referencing the two for years.
 *
 * The formatting and parsing here are pure. Allocation is not, and cannot be:
 * see the note on `nextSequence` below.
 */

export const REFERENCE_PREFIX = 'LPK'
const SEQUENCE_WIDTH = 5

export interface ReferenceParts {
  typePrefix: string
  year: number
  sequence: number
}

export function formatReferenceNo(parts: ReferenceParts): string {
  const sequence = String(parts.sequence).padStart(SEQUENCE_WIDTH, '0')
  return `${REFERENCE_PREFIX}/${parts.typePrefix}/${parts.year}/${sequence}`
}

const PATTERN = new RegExp(`^${REFERENCE_PREFIX}/([A-Z0-9]+)/(\\d{4})/(\\d+)$`)

/**
 * Parses a reference number back into its parts.
 *
 * Officers search by reference number constantly, and they will paste it with
 * surrounding whitespace out of an email. Returns null rather than throwing,
 * because "not a reference number" is an ordinary search input, not an error.
 */
export function parseReferenceNo(value: string): ReferenceParts | null {
  const match = PATTERN.exec(value.trim().toUpperCase())
  if (!match) return null

  return {
    typePrefix: match[1],
    year: Number(match[2]),
    sequence: Number(match[3]),
  }
}

/**
 * The sequence number that follows the highest one already issued.
 *
 * Deliberately `max + 1` rather than `count + 1`. Counting rows would reuse a
 * number as soon as any application is soft-deleted — and G2 means rows are
 * only ever soft-deleted, so the collision would be certain rather than
 * theoretical. A reference number is a record LPKmn cites in correspondence; it
 * must never point at two different applications.
 */
export function nextSequence(highestExisting: number | null): number {
  return (highestExisting ?? 0) + 1
}

/**
 * SQL that allocates the next reference number atomically.
 *
 * Two applicants submitting the same type in the same second is not a rare
 * case at a port — agents file in batches at the start of a shift. Read-then-
 * write in application code loses that race and produces a duplicate, which the
 * unique index then turns into a failed submission for a real user.
 *
 * So allocation happens inside the database, in one statement, under the row
 * lock the INSERT already takes. The caller runs this inside the same
 * transaction as the submission.
 *
 * `FOR UPDATE` is not used here on purpose: there is no row to lock until the
 * first application of the year exists. The unique index on reference_no is the
 * backstop, and the ON CONFLICT retry is what makes it invisible to the user.
 */
export const ALLOCATE_REFERENCE_SQL = `
  WITH next AS (
    SELECT COALESCE(
      MAX(CAST(split_part(reference_no, '/', 4) AS INTEGER)),
      0
    ) + 1 AS seq
    FROM applications
    WHERE reference_no LIKE $1
  )
  SELECT $2 || '/' || $3 || '/' || $4 || '/' || LPAD(next.seq::TEXT, ${SEQUENCE_WIDTH}, '0') AS reference_no
  FROM next
`

/** The LIKE pattern matching every reference for one type in one year. */
export function referenceLikePattern(typePrefix: string, year: number): string {
  return `${REFERENCE_PREFIX}/${typePrefix}/${year}/%`
}

/**
 * Licence numbers reuse the application's reference, with an L prefix.
 *
 * Keeping the two visibly linked is worth more than an independent sequence:
 * when an officer holds a licence and needs the application behind it, the
 * number tells them where to look.
 */
export function licenceNoFor(referenceNo: string): string {
  return `L/${referenceNo}`
}
