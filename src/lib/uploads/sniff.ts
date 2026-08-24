/**
 * Content-based file type detection — GP-11.
 *
 * The Garis Panduan requires uploads to be validated by real type, not by what
 * the client says. `File.type` and the filename extension are both attacker-
 * controlled: renaming `payload.html` to `surat.pdf` sets both to something
 * harmless. Only the bytes are evidence.
 *
 * Pure functions, no I/O — so they are testable without a database or a
 * request, and so this file can be exercised directly by the test suite.
 */

export interface Signature {
  readonly mime: string
  readonly extensions: readonly string[]
  readonly magic: readonly number[]
  /** Byte offset the magic appears at. Zero for everything we accept. */
  readonly offset: number
}

/**
 * Only the types LPKmn actually accepts for supporting documents.
 *
 * Deliberately short. Every entry here is a file a reviewer will open, and the
 * list grows only when an admin asks for it through `file_policies` and someone
 * adds the corresponding signature.
 */
export const SIGNATURES: readonly Signature[] = [
  { mime: 'application/pdf', extensions: ['pdf'], magic: [0x25, 0x50, 0x44, 0x46], offset: 0 },
  { mime: 'image/jpeg', extensions: ['jpg', 'jpeg'], magic: [0xff, 0xd8, 0xff], offset: 0 },
  {
    mime: 'image/png',
    extensions: ['png'],
    magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    offset: 0,
  },
  { mime: 'image/gif', extensions: ['gif'], magic: [0x47, 0x49, 0x46, 0x38], offset: 0 },
  // OOXML — docx, xlsx, pptx are all ZIP containers, indistinguishable by
  // magic bytes alone. The extension disambiguates *within* this type; it never
  // decides whether the file is a ZIP in the first place.
  {
    mime: 'application/zip',
    // eslint-disable-next-line kawalselia/no-hardcoded-lists -- these are the extensions that legitimately carry ZIP magic bytes, a fact about the file format rather than an LPKmn policy choice. Which of them an applicant may upload IS admin-editable, in file_policies.
    extensions: ['docx', 'xlsx', 'pptx', 'zip'],
    magic: [0x50, 0x4b, 0x03, 0x04],
    offset: 0,
  },
  // Legacy Office (OLE compound file) — .doc, .xls
  {
    mime: 'application/x-ole-storage',
    extensions: ['doc', 'xls'],
    magic: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1],
    offset: 0,
  },
]

function matches(bytes: Uint8Array, signature: Signature): boolean {
  const end = signature.offset + signature.magic.length
  if (bytes.length < end) return false

  for (let i = 0; i < signature.magic.length; i++) {
    if (bytes[signature.offset + i] !== signature.magic[i]) return false
  }

  return true
}

/**
 * Identifies a file by its leading bytes.
 *
 * Returns null for anything unrecognised, and null means reject. An allowlist
 * that falls back to "allow" when it cannot identify something is not an
 * allowlist.
 */
export function sniff(bytes: Uint8Array): Signature | null {
  return SIGNATURES.find((signature) => matches(bytes, signature)) ?? null
}

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase()
}
