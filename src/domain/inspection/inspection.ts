/**
 * Modul Kawal Selia & Pemeriksaan Pelabuhan — Phase 2 (M2-1 to M2-5).
 *
 * Handles:
 * 1. Inspection planning, scheduling & vessel safety inspection checklist (M2-1, M2-2).
 * 2. Corrective Action Request (CAR) lifecycle & follow-up tracking (M2-3).
 * 3. Port state & dangerous goods compliance monitoring (M2-5).
 *
 * Pure domain logic (Rule G7).
 */

export interface InspectionChecklistItem {
  itemId: string
  categoryMs: string
  categoryEn: string
  itemDescriptionMs: string
  itemDescriptionEn: string
  compliant: boolean
  deficiencySeverity: 'none' | 'minor' | 'major' | 'critical'
  deficiencyDetails?: string
  photoEvidenceRequired: boolean
}

export interface InspectionRecord {
  inspectionId: string
  vesselName: string
  imoNumber: string
  portLocation: string
  leadInspectorId: bigint
  leadInspectorName: string
  inspectionDate: Date
  checklist: InspectionChecklistItem[]
  overallResult: 'pass' | 'conditional_pass' | 'detained' | 'car_issued'
}

export interface CorrectiveActionRequest {
  carNumber: string
  inspectionId: string
  vesselName: string
  issueDate: Date
  rectificationDueDate: Date
  nonComplianceDescriptionMs: string
  nonComplianceDescriptionEn: string
  severity: 'minor' | 'major' | 'critical'
  rectificationPlanSubmitted: boolean
  rectificationVerifiedByOfficer: boolean
  status: 'open' | 'pending_verification' | 'closed' | 'escalated'
}

/**
 * Evaluates full inspection checklist and calculates outcome (M2-2, M2-3).
 */
export function evaluateInspectionResult(
  items: InspectionChecklistItem[],
): {
  overallResult: 'pass' | 'conditional_pass' | 'car_issued' | 'detained'
  majorDeficienciesCount: number
  minorDeficienciesCount: number
  requiresCar: boolean
} {
  const criticals = items.filter((i) => !i.compliant && i.deficiencySeverity === 'critical')
  const majors = items.filter((i) => !i.compliant && i.deficiencySeverity === 'major')
  const minors = items.filter((i) => !i.compliant && i.deficiencySeverity === 'minor')

  if (criticals.length > 0) {
    return {
      overallResult: 'detained',
      majorDeficienciesCount: majors.length + criticals.length,
      minorDeficienciesCount: minors.length,
      requiresCar: true,
    }
  }

  if (majors.length > 0) {
    return {
      overallResult: 'car_issued',
      majorDeficienciesCount: majors.length,
      minorDeficienciesCount: minors.length,
      requiresCar: true,
    }
  }

  if (minors.length > 0) {
    return {
      overallResult: 'conditional_pass',
      majorDeficienciesCount: 0,
      minorDeficienciesCount: minors.length,
      requiresCar: minors.length >= 3,
    }
  }

  return {
    overallResult: 'pass',
    majorDeficienciesCount: 0,
    minorDeficienciesCount: 0,
    requiresCar: false,
  }
}

/**
 * Validates Corrective Action Request (CAR) closure requirements (M2-3).
 */
export function validateCarClosure(
  car: CorrectiveActionRequest,
  now = new Date(),
): { canClose: boolean; reasonMs?: string; reasonEn?: string } {
  if (!car.rectificationPlanSubmitted) {
    return {
      canClose: false,
      reasonMs: 'Pelan tindakan pembetulan belum dimuat naik oleh operator vesel.',
      reasonEn: 'Corrective action plan has not been submitted by vessel operator.',
    }
  }

  if (!car.rectificationVerifiedByOfficer) {
    return {
      canClose: false,
      reasonMs: 'Pengesahan fizikal atau semakan dokumen pembetulan belum dibuat oleh Pegawai Penguatkuasa.',
      reasonEn: 'Physical verification or document audit has not been completed by Enforcement Officer.',
    }
  }

  if (now > car.rectificationDueDate && car.status === 'open') {
    return {
      canClose: false,
      reasonMs: 'Tempoh SLA pembetulan telah tamat; tindakan eskalasi penguatkuasaan diperlukan.',
      reasonEn: 'Rectification SLA deadline has expired; enforcement escalation required.',
    }
  }

  return { canClose: true }
}
