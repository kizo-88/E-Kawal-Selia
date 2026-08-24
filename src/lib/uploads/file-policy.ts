import { extensionOf, sniff } from './sniff'

/**
 * The upload policy engine — GP-11.
 *
 * "Setiap jenis fail boleh ditentukan saiznya... Jenis fail yang dimuatnaik
 *  juga boleh ditentukan mengikut kehendak kakitangan LPKmn."
 *
 * So the rules are data (`file_policies`), and this module applies them. Three
 * checks, all of which must pass:
 *
 *   1. the extension is on the allowlist
 *   2. the *bytes* say the file really is that type (GP-11 "real MIME")
 *   3. it is within the size cap
 *
 * `validate` is pure — the policy is passed in — so the whole matrix of
 * accept/reject cases is testable without a database or a live upload.
 */

export interface FilePolicy {
  contextCode: string
  allowedExtensions: string[]
  allowedMimes: string[]
  maxSizeKb: number
  maxFiles: number
}

export type RejectionCode =
  | 'EXTENSION_NOT_ALLOWED'
  | 'CONTENT_UNRECOGNISED'
  | 'CONTENT_MISMATCH'
  | 'MIME_NOT_ALLOWED'
  | 'TOO_LARGE'
  | 'EMPTY'

export interface Rejection {
  ok: false
  code: RejectionCode
  /** Shown to the applicant, so both languages (G4). */
  messageMs: string
  messageEn: string
}

export interface Acceptance {
  ok: true
  /** The type the bytes proved, not the type the client claimed. */
  detectedMime: string
  extension: string
}

export type ValidationResult = Acceptance | Rejection

const reject = (code: RejectionCode, messageMs: string, messageEn: string): Rejection => ({
  ok: false,
  code,
  messageMs,
  messageEn,
})

export interface CandidateFile {
  filename: string
  sizeBytes: number
  /** The first few hundred bytes is plenty; every signature sits at offset 0. */
  head: Uint8Array
}

export function validate(policy: FilePolicy, file: CandidateFile): ValidationResult {
  if (file.sizeBytes <= 0) {
    return reject('EMPTY', 'Fail kosong tidak boleh dimuat naik.', 'An empty file cannot be uploaded.')
  }

  const extension = extensionOf(file.filename)
  const allowed = policy.allowedExtensions.map((e) => e.toLowerCase())

  if (!extension || !allowed.includes(extension)) {
    return reject(
      'EXTENSION_NOT_ALLOWED',
      `Jenis fail .${extension || '?'} tidak dibenarkan. Format diterima: ${allowed.join(', ')}.`,
      `File type .${extension || '?'} is not allowed. Accepted formats: ${allowed.join(', ')}.`,
    )
  }

  const maxBytes = policy.maxSizeKb * 1024
  if (file.sizeBytes > maxBytes) {
    const limitMb = (policy.maxSizeKb / 1024).toFixed(1)
    return reject(
      'TOO_LARGE',
      `Saiz fail melebihi had ${limitMb} MB.`,
      `File exceeds the ${limitMb} MB limit.`,
    )
  }

  const signature = sniff(file.head)

  // Unrecognised content is rejected, never waved through. This is the check
  // that stops a renamed file: the extension already passed above.
  if (!signature) {
    return reject(
      'CONTENT_UNRECOGNISED',
      'Kandungan fail tidak dapat dikenal pasti. Sila muat naik fail yang sah.',
      'The file content could not be identified. Please upload a valid file.',
    )
  }

  if (!signature.extensions.includes(extension)) {
    return reject(
      'CONTENT_MISMATCH',
      `Kandungan fail tidak sepadan dengan sambungan .${extension}.`,
      `The file content does not match the .${extension} extension.`,
    )
  }

  if (policy.allowedMimes.length > 0 && !policy.allowedMimes.includes(signature.mime)) {
    return reject(
      'MIME_NOT_ALLOWED',
      'Jenis kandungan fail ini tidak dibenarkan.',
      'This file content type is not allowed.',
    )
  }

  return { ok: true, detectedMime: signature.mime, extension }
}
