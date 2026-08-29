/**
 * Modul Pemaliman (Marine Pilotage) — Phase 2 (M1-7, M1-8).
 *
 * Handles:
 * 1. Lesen Malim (Marine Pilot Licence) — New & Renewal, Pilotage Committee (Jawatankuasa Pemaliman) evaluation.
 * 2. Sijil Pengecualian Malim (Pilotage Exemption Certificate) — 2x Malim KPK evaluations (M1-R21).
 *
 * Pure domain logic (Rule G7).
 */

export interface PilotLicenceApplication {
  pilotName: string
  icOrPassportNo: string
  competencyCertNo: string
  issuingCountry: string
  pilotGrade: 'A' | 'B' | 'C' | 'D'
  vesselTonnageLimitGrossTon: number
  totalTripsLogged: number
  medicalFitnessValidUntil: Date
  applicationType: 'new' | 'renewal'
}

export interface PilotageCommitteeEvaluation {
  committeeMemberId: bigint
  committeeMemberName: string
  evaluationDate: Date
  oralExamPassed: boolean
  simulatorExamPassed: boolean
  medicalClearanceValid: boolean
  remarks: string
  decision: 'recommend' | 'reject' | 're_sit'
}

export interface ExemptionCertificateApplication {
  agentUserId: bigint
  companyName: string
  masterName: string
  masterCocNo: string
  vesselName: string
  vesselCallSign: string
  vesselGrossTonnage: number
  declaredTripsInPortPast12Months: number
  portLocationScope: string
}

export interface KpkEvaluatorAssessment {
  kpkOfficerId: bigint
  kpkOfficerName: string
  assessmentDate: Date
  practicalManoeuvreScore: number // Scale 1-100
  localRegulationsScore: number // Scale 1-100
  passed: boolean
  remarks: string
}

/**
 * Validates baseline eligibility for Marine Pilot Licence application (M1-7).
 */
export function validatePilotLicenceEligibility(
  application: PilotLicenceApplication,
  now = new Date(),
): { eligible: boolean; reasonMs?: string; reasonEn?: string } {
  if (application.medicalFitnessValidUntil <= now) {
    return {
      eligible: false,
      reasonMs: 'Sijil perubatan kesihatan pelaut telah tamat tempoh.',
      reasonEn: 'Seafarer medical fitness certificate has expired.',
    }
  }

  if (application.applicationType === 'new' && application.totalTripsLogged < 50) {
    return {
      eligible: false,
      reasonMs: 'Permohonan baru lesen malim memerlukan sekurang-kurangnya 50 log pergerakan kapal latihan.',
      reasonEn: 'New pilot licence application requires a minimum of 50 logged training ship movements.',
    }
  }

  return { eligible: true }
}

/**
 * Evaluates Jawatankuasa Pemaliman committee consensus (M1-7).
 */
export function evaluateCommitteeConsensus(
  evaluations: PilotageCommitteeEvaluation[],
  minCommitteeMembers = 3,
): { approved: boolean; statusMs: string; statusEn: string } {
  if (evaluations.length < minCommitteeMembers) {
    return {
      approved: false,
      statusMs: `Menunggu ulasan lengkap Jawatankuasa Pemaliman (${evaluations.length}/${minCommitteeMembers}).`,
      statusEn: `Awaiting complete Pilotage Committee evaluations (${evaluations.length}/${minCommitteeMembers}).`,
    }
  }

  const allClear = evaluations.every(
    (e) => e.oralExamPassed && e.simulatorExamPassed && e.medicalClearanceValid && e.decision === 'recommend',
  )

  if (allClear) {
    return {
      approved: true,
      statusMs: 'Disyorkan untuk pengeluaran Lesen Malim oleh Jawatankuasa Pemaliman.',
      statusEn: 'Recommended for Pilot Licence issuance by Pilotage Committee.',
    }
  }

  return {
    approved: false,
    statusMs: 'Tidak disyorkan oleh Jawatankuasa Pemaliman / Perlu Ujian Ulangan.',
    statusEn: 'Not recommended by Pilotage Committee / Re-examination required.',
  }
}

/**
 * Evaluates dual Malim KPK assessments for Pilotage Exemption Certificate (M1-R21, M1-8).
 */
export function evaluateDualKpkExemption(
  assessments: KpkEvaluatorAssessment[],
  minTripsRequired = 12,
  tripsLogged = 0,
): { approved: boolean; statusMs: string; statusEn: string } {
  if (tripsLogged < minTripsRequired) {
    return {
      approved: false,
      statusMs: `Syarat kelayakan minima ${minTripsRequired} perjalanan dalam had pelabuhan 12 bulan tidak dipenuhi (semasa: ${tripsLogged}).`,
      statusEn: `Minimum qualification of ${minTripsRequired} trips within port limits in past 12 months not met (current: ${tripsLogged}).`,
    }
  }

  if (assessments.length < 2) {
    return {
      approved: false,
      statusMs: `Memerlukan penilaian daripada 2 orang Malim KPK yang berbeza (M1-R21). Semasa: ${assessments.length}/2.`,
      statusEn: `Requires evaluation from 2 distinct KPK Pilots (M1-R21). Current: ${assessments.length}/2.`,
    }
  }

  const bothPassed =
    assessments.length >= 2 &&
    assessments[0]!.passed &&
    assessments[1]!.passed &&
    assessments[0]!.practicalManoeuvreScore >= 75 &&
    assessments[1]!.practicalManoeuvreScore >= 75

  if (bothPassed) {
    return {
      approved: true,
      statusMs: 'Kedua-dua Malim KPK mengesahkan kelayakan Sijil Pengecualian Pemaliman.',
      statusEn: 'Both KPK Pilots endorsed Pilotage Exemption Certificate qualification.',
    }
  }

  return {
    approved: false,
    statusMs: 'Penilaian Malim KPK tidak mencapai markah kelayakan minima (75%).',
    statusEn: 'KPK Pilot evaluation did not meet the minimum passing threshold (75%).',
  }
}
