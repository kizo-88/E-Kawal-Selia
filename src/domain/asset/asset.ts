/**
 * Modul Pengurusan Aset & Peralatan Keselamatan — Phase 2 (M6-1 to M6-4).
 *
 * Handles:
 * 1. Pendaftaran Aset Konsesi (Concession Asset Register M6-2).
 * 2. Permohonan Pinjaman & Pemulangan Peralatan Keselamatan Maritim (M6-1).
 * 3. Perancangan & Rekod Penyelenggaraan Berkala (M6-3).
 * 4. Aliran Kerja Naik Taraf / Pembinaan Baru (M6-4).
 *
 * Pure domain logic (Rule G7, G4).
 */

export interface ConcessionAsset {
  assetId: string
  assetCode: string
  nameMs: string
  nameEn: string
  category: 'vessel' | 'containment' | 'telecom' | 'fire_fighting' | 'nav_aid' | 'infrastructure'
  concessionHolder: string
  operationalStatus: 'operational' | 'under_maintenance' | 'standby' | 'decommissioned'
  acquisitionDate: Date
  lastServiceDate: Date
  nextServiceDueDate: Date
  healthScorePercent: number
}

export interface EquipmentLoanRequest {
  loanId: string
  applicantCompany: string
  applicantName: string
  equipmentType: 'oil_boom' | 'skimmer' | 'gas_detector' | 'foam_trailer' | 'marine_vhf'
  quantityRequested: number
  loanStartDate: Date
  expectedReturnDate: Date
  actualReturnDate?: Date
  purposeDescription: string
  depositPaid: boolean
  inspectionOnReturnPassed?: boolean
  status: 'submitted' | 'approved' | 'on_loan' | 'returned' | 'overdue' | 'rejected'
}

export interface MaintenanceRecord {
  serviceId: string
  assetCode: string
  serviceDate: Date
  maintenanceType: 'preventive' | 'corrective' | 'statutory_survey'
  serviceProvider: string
  costRm: number
  partsReplaced: string[]
  isSatisfactory: boolean
  certifiedByOfficer: string
}

/**
 * Validates equipment loan request feasibility and limits (M6-1).
 */
export function validateEquipmentLoanRequest(
  request: EquipmentLoanRequest,
  availableStock: number,
  now = new Date(),
): { eligible: boolean; reasonMs?: string; reasonEn?: string } {
  if (request.expectedReturnDate <= request.loanStartDate) {
    return {
      eligible: false,
      reasonMs: 'Tarikh pemulangan jangkaan mestilah selepas tarikh permulaan pinjaman.',
      reasonEn: 'Expected return date must be after loan start date.',
    }
  }

  const durationDays = Math.ceil(
    (request.expectedReturnDate.getTime() - request.loanStartDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (durationDays > 30) {
    return {
      eligible: false,
      reasonMs: 'Tempoh maksimum pinjaman peralatan keselamatan ialah 30 hari.',
      reasonEn: 'Maximum equipment loan duration is 30 days.',
    }
  }

  if (request.quantityRequested > availableStock) {
    return {
      eligible: false,
      reasonMs: `Kuantiti yang dipohon (${request.quantityRequested}) melebihi baki stok sedia ada (${availableStock}).`,
      reasonEn: `Requested quantity (${request.quantityRequested}) exceeds available stock (${availableStock}).`,
    }
  }

  if (request.loanStartDate < now) {
    return {
      eligible: false,
      reasonMs: 'Tarikh pinjaman tidak boleh mendahului tarikh semasa.',
      reasonEn: 'Loan start date cannot precede current date.',
    }
  }

  return { eligible: true }
}

/**
 * Evaluates asset maintenance urgency based on service schedule and health score (M6-3).
 */
export function evaluateAssetMaintenanceStatus(
  asset: ConcessionAsset,
  asOfDate = new Date(),
): {
  isOverdue: boolean
  maintenanceStatus: 'optimal' | 'due_soon' | 'critical_overdue'
  statusLabelMs: string
  statusLabelEn: string
} {
  const daysUntilDue = Math.ceil(
    (asset.nextServiceDueDate.getTime() - asOfDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (daysUntilDue < 0 || asset.healthScorePercent < 60) {
    return {
      isOverdue: true,
      maintenanceStatus: 'critical_overdue',
      statusLabelMs: 'Penyelenggaraan Terlewat / Kritikal',
      statusLabelEn: 'Critical Overdue / Maintenance Required',
    }
  }

  if (daysUntilDue <= 14) {
    return {
      isOverdue: false,
      maintenanceStatus: 'due_soon',
      statusLabelMs: 'Penyelenggaraan Perlu Dijadualkan Segera',
      statusLabelEn: 'Maintenance Due Soon',
    }
  }

  return {
    isOverdue: false,
    maintenanceStatus: 'optimal',
    statusLabelMs: 'Status Operasi Optimum',
    statusLabelEn: 'Optimal Operating Condition',
  }
}
