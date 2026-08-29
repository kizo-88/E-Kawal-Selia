import { describe, expect, it } from 'vitest'
import {
  validateEquipmentLoanRequest,
  evaluateAssetMaintenanceStatus,
  type ConcessionAsset,
  type EquipmentLoanRequest,
} from '../src/domain/asset/asset'
import {
  calculateApplicationFee,
  processSuccessfulPayment,
  type FeeStructure,
  type PaymentTransaction,
} from '../src/domain/payment/payment'
import {
  isPointInsidePolygon,
  validateVesselPortLimitPosition,
  KEMAMAN_PORT_LIMITS_POLYGON,
} from '../src/domain/gis/gis'

describe('Phase 2 — Modul Pengurusan Aset (M6-1 to M6-4)', () => {
  it('validates equipment loan request duration and stock', () => {
    const validReq: EquipmentLoanRequest = {
      loanId: 'LN-2026-001',
      applicantCompany: 'Kemaman Marine Works',
      applicantName: 'En. Razak',
      equipmentType: 'oil_boom',
      quantityRequested: 2,
      loanStartDate: new Date('2026-09-01'),
      expectedReturnDate: new Date('2026-09-15'),
      purposeDescription: 'Bunkering containment standby',
      depositPaid: true,
      status: 'submitted',
    }

    expect(validateEquipmentLoanRequest(validReq, 5, new Date('2026-08-20')).eligible).toBe(true)

    // Exceeds stock
    expect(validateEquipmentLoanRequest(validReq, 1, new Date('2026-08-20')).eligible).toBe(false)

    // Exceeds 30 days
    const longReq: EquipmentLoanRequest = {
      ...validReq,
      expectedReturnDate: new Date('2026-10-15'),
    }
    expect(validateEquipmentLoanRequest(longReq, 5, new Date('2026-08-20')).eligible).toBe(false)
  })

  it('evaluates asset maintenance overdue status and health degradation', () => {
    const optimalAsset: ConcessionAsset = {
      assetId: 'AST-01',
      assetCode: 'TUG-KUANTAN-1',
      nameMs: 'Bot Tunda 1',
      nameEn: 'Tugboat 1',
      category: 'vessel',
      concessionHolder: 'KPK',
      operationalStatus: 'operational',
      acquisitionDate: new Date('2020-01-01'),
      lastServiceDate: new Date('2026-01-01'),
      nextServiceDueDate: new Date('2026-12-01'),
      healthScorePercent: 95,
    }

    expect(evaluateAssetMaintenanceStatus(optimalAsset, new Date('2026-08-01')).maintenanceStatus).toBe('optimal')

    const dueSoonAsset: ConcessionAsset = {
      ...optimalAsset,
      nextServiceDueDate: new Date('2026-08-10'),
    }
    expect(evaluateAssetMaintenanceStatus(dueSoonAsset, new Date('2026-08-01')).maintenanceStatus).toBe('due_soon')

    const degradedAsset: ConcessionAsset = {
      ...optimalAsset,
      healthScorePercent: 45,
    }
    expect(evaluateAssetMaintenanceStatus(degradedAsset, new Date('2026-08-01')).maintenanceStatus).toBe('critical_overdue')
  })
})

describe('Phase 2 — Gerbang Pembayaran Maritim FPX (X-1)', () => {
  it('calculates accurate fee breakdown with SST', () => {
    const structure: FeeStructure = {
      applicationTypeCode: 'LESEN_SOKONGAN',
      processingFeeRm: 500,
      licenceFeeAnnualRm: 2000,
      statutoryLevyRm: 100,
      sstPercent: 8,
    }

    const fee = calculateApplicationFee(structure, 1)
    expect(fee.subtotalRm).toBe(2600)
    expect(fee.sstAmountRm).toBe(208)
    expect(fee.totalPayableRm).toBe(2808)
  })

  it('processes verified payment and produces official digital receipt', () => {
    const txn: PaymentTransaction = {
      transactionId: 'TXN-99881',
      applicationRefNo: 'LPK/LPS/2026/00142',
      payerName: 'Kemaman Supply Base Sdn. Bhd.',
      payerEmail: 'finance@ksb.com.my',
      fpxBankCode: 'MB2U0227',
      fpxBankName: 'Maybank2u',
      amountCents: 280800,
      currency: 'MYR',
      paymentStatus: 'successful',
      paymentDate: new Date(),
    }

    const res = processSuccessfulPayment(txn, 842, new Date('2026-08-29'))
    expect(res.receipt.receiptNumber).toBe('RESIT-LPK-2026-000842')
    expect(res.receipt.totalAmountRm).toBe(2808)
    expect(res.receipt.digitalSignature).toContain('LPK-SIG-')
    expect(res.statusMs).toContain('Pembayaran FPX Berjaya')
  })
})

describe('Phase 2 — GIS & Pemetaan Sempadan Pelabuhan Kemaman (X-2)', () => {
  it('correctly identifies coordinates within and outside Kemaman Port Limits', () => {
    // Inside port limits (4.25 N, 103.50 E)
    const insidePoint = { latitude: 4.25, longitude: 103.50 }
    expect(isPointInsidePolygon(insidePoint, KEMAMAN_PORT_LIMITS_POLYGON)).toBe(true)
    expect(validateVesselPortLimitPosition(insidePoint).isWithinPortLimits).toBe(true)

    // Outside port limits (4.10 N, 103.80 E)
    const outsidePoint = { latitude: 4.10, longitude: 103.80 }
    expect(isPointInsidePolygon(outsidePoint, KEMAMAN_PORT_LIMITS_POLYGON)).toBe(false)
    expect(validateVesselPortLimitPosition(outsidePoint).isWithinPortLimits).toBe(false)
  })
})
