import { describe, expect, it } from 'vitest'

import { type FilePolicy, validate } from '../src/lib/uploads/file-policy'
import { extensionOf, sniff } from '../src/lib/uploads/sniff'

/**
 * GP-11 requires uploads to be validated by real content type. The case that
 * matters is the renamed file: extension and client-reported MIME both say
 * "pdf", only the bytes disagree. If that case passes, the check is decorative.
 */

const bytes = (...values: number[]) => new Uint8Array(values)

const PDF = bytes(0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37)
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0)
const DOCX = bytes(0x50, 0x4b, 0x03, 0x04, 0x14, 0x00)
const HTML = bytes(0x3c, 0x21, 0x44, 0x4f, 0x43, 0x54, 0x59, 0x50, 0x45) // <!DOCTYPE

const policy: FilePolicy = {
  contextCode: 'PERMOHONAN_SOKONGAN',
  allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
  allowedMimes: [],
  maxSizeKb: 5120,
  maxFiles: 3,
}

describe('sniff', () => {
  it('identifies the formats LPKmn accepts', () => {
    expect(sniff(PDF)?.mime).toBe('application/pdf')
    expect(sniff(PNG)?.mime).toBe('image/png')
    expect(sniff(JPEG)?.mime).toBe('image/jpeg')
    expect(sniff(DOCX)?.mime).toBe('application/zip')
  })

  it('returns null for anything unrecognised, so the caller must reject', () => {
    expect(sniff(HTML)).toBeNull()
    expect(sniff(bytes())).toBeNull()
  })

  it('reads extensions case-insensitively', () => {
    expect(extensionOf('Surat Sokongan.PDF')).toBe('pdf')
    expect(extensionOf('no-extension')).toBe('')
  })
})

describe('validate', () => {
  it('accepts a genuine PDF', () => {
    const result = validate(policy, { filename: 'sokongan.pdf', sizeBytes: 2048, head: PDF })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.detectedMime).toBe('application/pdf')
  })

  it('rejects an extension that is not on the allowlist', () => {
    const result = validate(policy, { filename: 'macro.docx', sizeBytes: 2048, head: DOCX })
    expect(result).toMatchObject({ ok: false, code: 'EXTENSION_NOT_ALLOWED' })
  })

  it('rejects HTML renamed to .pdf — the whole point of sniffing', () => {
    const result = validate(policy, { filename: 'payload.pdf', sizeBytes: 2048, head: HTML })
    expect(result).toMatchObject({ ok: false, code: 'CONTENT_UNRECOGNISED' })
  })

  it('rejects a PNG renamed to .pdf, where the content IS recognised but wrong', () => {
    const result = validate(policy, { filename: 'sijil.pdf', sizeBytes: 2048, head: PNG })
    expect(result).toMatchObject({ ok: false, code: 'CONTENT_MISMATCH' })
  })

  it('enforces the size cap from the policy, not a constant', () => {
    const tight: FilePolicy = { ...policy, maxSizeKb: 1 }
    const result = validate(tight, { filename: 'besar.pdf', sizeBytes: 5000, head: PDF })
    expect(result).toMatchObject({ ok: false, code: 'TOO_LARGE' })
  })

  it('rejects an empty file', () => {
    const result = validate(policy, { filename: 'kosong.pdf', sizeBytes: 0, head: PDF })
    expect(result).toMatchObject({ ok: false, code: 'EMPTY' })
  })

  it('honours a MIME allowlist when the policy sets one', () => {
    const imagesOnly: FilePolicy = { ...policy, allowedMimes: ['image/png', 'image/jpeg'] }
    const result = validate(imagesOnly, { filename: 'sokongan.pdf', sizeBytes: 2048, head: PDF })
    expect(result).toMatchObject({ ok: false, code: 'MIME_NOT_ALLOWED' })
  })

  it('gives every rejection a message in both languages (G4)', () => {
    const result = validate(policy, { filename: 'payload.pdf', sizeBytes: 2048, head: HTML })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.messageMs.length).toBeGreaterThan(0)
      expect(result.messageEn.length).toBeGreaterThan(0)
      expect(result.messageMs).not.toBe(result.messageEn)
    }
  })
})
