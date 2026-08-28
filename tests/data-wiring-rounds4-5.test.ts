import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/db', () => ({ prisma: {} }))
const MOCK_APP_TYPE = {
  id: 1n,
  code: 'LESEN_SOKONGAN',
  nameMs: 'Lesen Perkhidmatan Sokongan',
  nameEn: 'Supporting Service Licence',
  referencePrefix: 'LPS',
  workflowId: 1n,
  validityMonths: 12,
  documentTemplateCode: 'LESEN',
  formSchema: { version: 1, steps: [{ sequence: 1, code: 'info', titleMs: 'Info', titleEn: 'Info', fields: [
    { name: 'portLocation', labelMs: 'Lokasi', labelEn: 'Location', kind: 'text', required: true },
    { name: 'scopeDescription', labelMs: 'Skop', labelEn: 'Scope', kind: 'textarea', required: true },
  ]}] },
}

vi.mock('@/lib/db/scoped', () => ({
  withUser: vi.fn((_userId, callback) => callback({
    auditLog: { count: vi.fn().mockResolvedValue(10), create: vi.fn().mockResolvedValue({ id: 1n }) },
    user: { findUnique: vi.fn().mockResolvedValue({ id: 1n, name: 'Test User', email: 'test@example.com', phone: '+60123456789', status: 'active', organisations: [], undertakings: [{ undertakingVersionSnapshot: 'Versi 2026.1', acceptedAt: new Date('2026-01-12T10:14:00Z') }] }) },
    generatedDocument: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 1n, qrToken: 'TESTTOKEN00000000000000000000000000' }) },
    applicationType: { findUnique: vi.fn().mockResolvedValue(MOCK_APP_TYPE) },
    application: {
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1n, referenceNo: 'LPK/LPS/2026/00001' }),
      update: vi.fn().mockResolvedValue({ id: 1n }),
    },
    workflowStage: { findFirst: vi.fn().mockResolvedValue({ id: 1n, workflowId: 1n, sequence: 1 }), findUnique: vi.fn().mockResolvedValue({ id: 1n, workflowId: 1n, sequence: 1 }) },
    licence: { create: vi.fn().mockResolvedValue({ id: 1n, licenceNo: 'L/LPK/LPS/2026/00001' }), update: vi.fn().mockResolvedValue({ id: 1n }) },
    $queryRawUnsafe: vi.fn().mockResolvedValue([{ reference_no: 'LPK/LPS/2026/00001' }]),
  })),
  asAnonymous: vi.fn((callback) => callback({
    generatedDocument: { findUnique: vi.fn().mockResolvedValue(null) },
  })),
}))
vi.mock('../src/lib/db/scoped', () => ({
  withUser: vi.fn((_userId, callback) => callback({
    auditLog: { count: vi.fn().mockResolvedValue(10), create: vi.fn().mockResolvedValue({ id: 1n }) },
    user: { findUnique: vi.fn().mockResolvedValue({ id: 1n, name: 'Test User', email: 'test@example.com', phone: '+60123456789', status: 'active', organisations: [], undertakings: [{ undertakingVersionSnapshot: 'Versi 2026.1', acceptedAt: new Date('2026-01-12T10:14:00Z') }] }) },
    generatedDocument: { findUnique: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: 1n, qrToken: 'TESTTOKEN00000000000000000000000000' }) },
    applicationType: { findUnique: vi.fn().mockResolvedValue(MOCK_APP_TYPE) },
    application: {
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1n, referenceNo: 'LPK/LPS/2026/00001' }),
      update: vi.fn().mockResolvedValue({ id: 1n }),
    },
    workflowStage: { findFirst: vi.fn().mockResolvedValue({ id: 1n, workflowId: 1n, sequence: 1 }), findUnique: vi.fn().mockResolvedValue({ id: 1n, workflowId: 1n, sequence: 1 }) },
    licence: { create: vi.fn().mockResolvedValue({ id: 1n, licenceNo: 'L/LPK/LPS/2026/00001' }), update: vi.fn().mockResolvedValue({ id: 1n }) },
    $queryRawUnsafe: vi.fn().mockResolvedValue([{ reference_no: 'LPK/LPS/2026/00001' }]),
  })),
  asAnonymous: vi.fn((callback) => callback({
    generatedDocument: { findUnique: vi.fn().mockResolvedValue(null) },
  })),
}))

import { queryDashboardStats } from '../src/app/(admin)/dashboard/query'
import { queryApplications, applicationTableSchema } from '../src/app/(admin)/permohonan/query'
import { submitApplication, saveDraftApplication } from '../src/app/(admin)/permohonan/baru/actions'
import { queryIssuedLicences, licenceTableSchema } from '../src/app/(admin)/pelesenan/query'
import { queryUserProfile } from '../src/app/(admin)/profil/query'
import { changeUserPassword } from '../src/app/(admin)/profil/actions'
import { queryLicenceVerification } from '../src/app/(public)/semak/[token]/query'

describe('Lane D — Data Wiring Rounds 4 & 5 (Main Flows & Exporters)', () => {
  describe('Dashboard Wiring (GP-15)', () => {
    it('returns summary statistics and 12-month histogram points', async () => {
      const stats = await queryDashboardStats(1n, 'superadmin')
      expect(stats.totalApplications).toBeGreaterThan(0)
      expect(stats.activeLicences).toBeGreaterThan(0)
      expect(stats.monthlyHistogram).toHaveLength(12)
    })
  })

  describe('Universal List Wiring for Applications (GP-12)', () => {
    it('provides valid table schema with sortable and searchable columns', () => {
      expect(applicationTableSchema.code).toBe('PERMOHONAN_LIST')
      expect(applicationTableSchema.columns.length).toBeGreaterThanOrEqual(4)
      expect(applicationTableSchema.defaultSort.column).toBe('submittedDate')
    })

    it('queries applications with quarter and status filtering', async () => {
      const all = await queryApplications(1n)
      expect(all.length).toBeGreaterThanOrEqual(5)

      const filtered = await queryApplications(1n, { quarter: 'Q3', status: 'approved' })
      expect(filtered.every((r) => r.quarter === 'Q3' && r.status === 'approved')).toBe(true)
    })
  })

  describe('Application Form Server Actions (M1-R02, M1-R03)', () => {
    it('saves draft without undertaking requirement', async () => {
      const res = await saveDraftApplication('1', {
        licenceType: 'LESEN_SOKONGAN',
        portLocation: 'Dermaga Barat',
        scopeDescription: 'Logistik',
        completedStep: 1,
      })
      expect(res.ok).toBe(true)
    })

    it('rejects final submission without Aku-Janji undertaking (GP-06)', async () => {
      const res = await submitApplication('1', {
        licenceType: 'LESEN_SOKONGAN',
        portLocation: 'Dermaga Barat',
        scopeDescription: 'Logistik',
        completedStep: 3,
        acceptedUndertaking: false,
      })
      expect(res.ok).toBe(false)
      expect(res.messageMs).toContain('Aku-Janji')
    })

    it('accepts final submission with valid undertaking', async () => {
      const res = await submitApplication('1', {
        licenceType: 'LESEN_SOKONGAN',
        portLocation: 'Dermaga Barat',
        scopeDescription: 'Logistik',
        completedStep: 3,
        acceptedUndertaking: true,
      })
      expect(res.ok).toBe(true)
      expect(res.referenceNo).toMatch(/^LPK\/LPS\/\d{4}\/\d{5}$/)
    })
  })

  describe('Licences Universal List (M1-R11)', () => {
    it('has valid licence table schema', () => {
      expect(licenceTableSchema.code).toBe('LICENCES_LIST')
      expect(licenceTableSchema.columns.length).toBeGreaterThanOrEqual(4)
    })

    it('filters licences by keyword search', async () => {
      const results = await queryIssuedLicences(1n, 'Marine Chandling')
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results[0].licenceNo).toBe('LPK/LPS/2026/00142')
    })
  })

  describe('User Profile & Password Actions (GP-03, GP-05)', () => {
    it('queries user profile with Aku-Janji status', async () => {
      const profile = await queryUserProfile(1n)
      expect(profile.name).toBeTruthy()
      expect(profile.hasSignedAkuJanji).toBe(true)
    })

    it('enforces 12-character password minimum in change password action', async () => {
      const shortRes = await changeUserPassword('1', 'oldPass12345!', 'shortPass')
      expect(shortRes.ok).toBe(false)
      expect(shortRes.messageMs).toContain('12 aksara')

      const validRes = await changeUserPassword('1', 'oldPass12345!', 'NewStrongPass2026!#')
      expect(validRes.ok).toBe(true)
    })
  })

  describe('Public QR Verification Minimal Disclosure (X-R11, X-R12)', () => {
    it('returns only the minimal public payload and never sensitive data', async () => {
      const result = await queryLicenceVerification('unissued-demo-qr-token-not-a-real-secret')
      // No licence is issued behind a random token in this environment — the
      // page must say so rather than fabricate one (X-R12).
      expect(result.found).toBe(false)
      expect(result.qrToken).toBe('unissued-demo-qr-token-not-a-real-secret')
      expect(result.issuingAuthorityMs).toBeTruthy()
      expect(result.issuingAuthorityEn).toBeTruthy()

      // Strictly verify no confidential fields exist on the public payload.
      const rec = result as unknown as Record<string, unknown>
      expect(rec.icNo).toBeUndefined()
      expect(rec.address).toBeUndefined()
      expect(rec.phone).toBeUndefined()
      expect(rec.attachments).toBeUndefined()
    })

  })
})
