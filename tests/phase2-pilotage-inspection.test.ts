import { describe, expect, it } from 'vitest'
import {
  validatePilotLicenceEligibility,
  evaluateCommitteeConsensus,
  evaluateDualKpkExemption,
  type PilotLicenceApplication,
  type PilotageCommitteeEvaluation,
  type KpkEvaluatorAssessment,
} from '../src/domain/pilotage/pilotage'
import {
  evaluateInspectionResult,
  validateCarClosure,
  type InspectionChecklistItem,
  type CorrectiveActionRequest,
} from '../src/domain/inspection/inspection'

describe('Phase 2 — Modul Pemaliman (Pilotage Domain M1-7, M1-8)', () => {
  it('validates seafarer medical fitness validity for pilot licence', () => {
    const validApp: PilotLicenceApplication = {
      pilotName: 'Kapt. Ismail bin Yusof',
      icOrPassportNo: '750101-11-5433',
      competencyCertNo: 'COC-MASTER-5000GT-2024',
      issuingCountry: 'Malaysia',
      pilotGrade: 'A',
      vesselTonnageLimitGrossTon: 50000,
      totalTripsLogged: 120,
      medicalFitnessValidUntil: new Date('2027-12-31'),
      applicationType: 'new',
    }

    const expiredApp: PilotLicenceApplication = {
      ...validApp,
      medicalFitnessValidUntil: new Date('2025-01-01'),
    }

    expect(validatePilotLicenceEligibility(validApp, new Date('2026-08-01')).eligible).toBe(true)
    expect(validatePilotLicenceEligibility(expiredApp, new Date('2026-08-01')).eligible).toBe(false)
  })

  it('evaluates Jawatankuasa Pemaliman committee consensus (min 3 members)', () => {
    const unanimousClear: PilotageCommitteeEvaluation[] = [
      {
        committeeMemberId: BigInt(1),
        committeeMemberName: 'Kapt. Mohd Roslan',
        evaluationDate: new Date(),
        oralExamPassed: true,
        simulatorExamPassed: true,
        medicalClearanceValid: true,
        remarks: 'Layak',
        decision: 'recommend',
      },
      {
        committeeMemberId: BigInt(2),
        committeeMemberName: 'Kapt. Harun',
        evaluationDate: new Date(),
        oralExamPassed: true,
        simulatorExamPassed: true,
        medicalClearanceValid: true,
        remarks: 'Disokong',
        decision: 'recommend',
      },
      {
        committeeMemberId: BigInt(3),
        committeeMemberName: 'Dato PB LPKmn',
        evaluationDate: new Date(),
        oralExamPassed: true,
        simulatorExamPassed: true,
        medicalClearanceValid: true,
        remarks: 'Diluluskan',
        decision: 'recommend',
      },
    ]

    const result = evaluateCommitteeConsensus(unanimousClear)
    expect(result.approved).toBe(true)
    expect(result.statusMs).toContain('Disyorkan untuk pengeluaran')
  })

  it('evaluates dual Malim KPK exemption assessments (M1-R21)', () => {
    const assessments: KpkEvaluatorAssessment[] = [
      {
        kpkOfficerId: BigInt(10),
        kpkOfficerName: 'Malim Kanan 1',
        assessmentDate: new Date(),
        practicalManoeuvreScore: 88,
        localRegulationsScore: 90,
        passed: true,
        remarks: 'Pemanduan kemas',
      },
      {
        kpkOfficerId: BigInt(11),
        kpkOfficerName: 'Malim Kanan 2',
        assessmentDate: new Date(),
        practicalManoeuvreScore: 82,
        localRegulationsScore: 85,
        passed: true,
        remarks: 'Memuaskan',
      },
    ]

    const passedExemption = evaluateDualKpkExemption(assessments, 12, 15)
    expect(passedExemption.approved).toBe(true)

    const insufficientTrips = evaluateDualKpkExemption(assessments, 12, 8)
    expect(insufficientTrips.approved).toBe(false)
  })
})

describe('Phase 2 — Modul Kawal Selia & Pemeriksaan (M2-1 to M2-5)', () => {
  it('identifies critical safety deficiencies leading to vessel detention', () => {
    const checklist: InspectionChecklistItem[] = [
      {
        itemId: 'CHK-01',
        categoryMs: 'Peralatan Keselamatan',
        categoryEn: 'Safety Equipment',
        itemDescriptionMs: 'Rakit Penyelamat & Jaket Keselamatan SOLAS',
        itemDescriptionEn: 'Life Raft & SOLAS Lifejackets',
        compliant: false,
        deficiencySeverity: 'critical',
        deficiencyDetails: 'Rakit keselamatan tamat tempoh servis',
        photoEvidenceRequired: true,
      },
    ]

    const result = evaluateInspectionResult(checklist)
    expect(result.overallResult).toBe('detained')
    expect(result.requiresCar).toBe(true)
  })

  it('validates Corrective Action Request (CAR) closure requirements', () => {
    const openCar: CorrectiveActionRequest = {
      carNumber: 'CAR/2026/00012',
      inspectionId: 'INSP-2026-0089',
      vesselName: 'MV Southern Carrier',
      issueDate: new Date('2026-08-01'),
      rectificationDueDate: new Date('2026-08-15'),
      nonComplianceDescriptionMs: 'Peralatan pemadam api perlu diservis',
      nonComplianceDescriptionEn: 'Fire extinguishers require servicing',
      severity: 'major',
      rectificationPlanSubmitted: true,
      rectificationVerifiedByOfficer: true,
      status: 'pending_verification',
    }

    expect(validateCarClosure(openCar).canClose).toBe(true)

    const unverifiedCar: CorrectiveActionRequest = {
      ...openCar,
      rectificationVerifiedByOfficer: false,
    }
    expect(validateCarClosure(unverifiedCar).canClose).toBe(false)
  })
})
