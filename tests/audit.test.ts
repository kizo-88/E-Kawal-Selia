import { describe, expect, it } from 'vitest'

import { AUDIT_ACTIONS, renderAuditLabel } from '../src/lib/audit/actions'
import { redact } from '../src/lib/audit/redact'

/**
 * GP-18 forbids generic audit entries and X-R02 puts the output in front of
 * Audit Dalam and an overtime claim. These tests hold the registry to that:
 * every action reads as a sentence, in both languages, with nothing generic
 * and no template syntax leaking through.
 */

const GENERIC = /^(update|delete|create|insert|edit|remove|save|change)$/i

describe('the audit action registry', () => {
  const actions = Object.values(AUDIT_ACTIONS)

  it('has no generic action codes — the thing GP-18 names explicitly', () => {
    for (const action of actions) {
      expect(action.code).not.toMatch(GENERIC)
    }
  })

  it('gives every action a sentence in both languages (G4)', () => {
    for (const action of actions) {
      expect(action.templateMs.length, action.code).toBeGreaterThan(10)
      expect(action.templateEn.length, action.code).toBeGreaterThan(10)
      expect(action.templateMs, action.code).not.toBe(action.templateEn)
    }
  })

  it('files every action under a module, so the audit report can be filtered', () => {
    for (const action of actions) {
      expect(action.moduleCode, action.code).toBeTruthy()
    }
  })

  it('keys the registry by its own action code', () => {
    for (const [key, action] of Object.entries(AUDIT_ACTIONS)) {
      expect(action.code).toBe(key)
    }
  })
})

describe('renderAuditLabel', () => {
  it('produces the kind of line an auditor can read', () => {
    const rendered = renderAuditLabel(AUDIT_ACTIONS.DOKUMEN_DIJANA.templateMs, {
      subject: 'Lesen Perkhidmatan Sokongan',
      reference: 'LPK/LPS/2026/00123',
      actor: 'Ketua Unit M/T',
    })

    expect(rendered).toBe(
      'Dokumen Lesen Perkhidmatan Sokongan bagi rujukan LPK/LPS/2026/00123 dijana oleh Ketua Unit M/T',
    )
  })

  it('never leaves template syntax in the output', () => {
    const rendered = renderAuditLabel(AUDIT_ACTIONS.DOKUMEN_DIJANA.templateMs, {})
    expect(rendered).not.toContain('{')
    expect(rendered).not.toContain('}')
  })

  it('substitutes an em dash for a missing value rather than an empty gap', () => {
    const rendered = renderAuditLabel('Akaun {subject} dikunci', { subject: '   ' })
    expect(rendered).toBe('Akaun — dikunci')
  })
})

describe('redact', () => {
  it('strips secrets from a change diff', () => {
    const safe = redact({
      name: 'Ahmad',
      passwordHash: '$2y$12$abcdefghijklmnop',
      mfaSecret: 'JBSWY3DPEHPK3PXP',
      icNo: '900101015555',
      qrToken: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    }) as Record<string, unknown>

    expect(safe.name).toBe('Ahmad')
    expect(safe.passwordHash).toBe('[redacted]')
    expect(safe.mfaSecret).toBe('[redacted]')
    expect(safe.icNo).toBe('[redacted]')
    expect(safe.qrToken).toBe('[redacted]')
  })

  it('handles snake_case columns too', () => {
    const safe = redact({ password_hash: 'x', mfa_secret: 'y', ic_no: 'z' }) as Record<
      string,
      unknown
    >

    expect(Object.values(safe)).toEqual(['[redacted]', '[redacted]', '[redacted]'])
  })
})
