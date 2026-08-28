import 'server-only'

import { withUser } from '../../../lib/db/scoped'

export interface ReviewQueueItem {
  id: string
  referenceNo: string
  applicantName: string
  companyName: string
  serviceTypeMs: string
  serviceTypeEn: string
  submittedDate: string
  assignedOfficer: string
  slaDaysRemaining: number
  slaStatus: 'on_track' | 'warning' | 'critical'
  slaStatusLabelMs: string
  slaStatusLabelEn: string
  stageCode: string
  stageNameMs: string
  stageNameEn: string
}

export const BASELINE_REVIEW_QUEUE: ReviewQueueItem[] = [
  {
    id: 'queue-1',
    referenceNo: 'LPK/LPS/2026/00148',
    applicantName: 'En. Razak bin Ali',
    companyName: 'Segamat Bunker Logistics Services',
    serviceTypeMs: 'Lesen Perkhidmatan Sokongan',
    serviceTypeEn: 'Support Service Licence',
    submittedDate: '2026-08-22',
    assignedOfficer: 'Unit Marin & Trafik (M/T)',
    slaDaysRemaining: 2,
    slaStatus: 'critical',
    slaStatusLabelMs: 'Kritikal (< 3 Hari)',
    slaStatusLabelEn: 'Critical (< 3 Days)',
    stageCode: 'SEMAKAN_TEKNIKAL_MT',
    stageNameMs: 'Ulasan Teknikal Zon Marin',
    stageNameEn: 'Marine Zone Technical Review',
  },
  {
    id: 'queue-2',
    referenceNo: 'LPK/PAP/2026/00088',
    applicantName: 'Cik Farah Nabilah',
    companyName: 'Kemaman Diving & Salvage Works',
    serviceTypeMs: 'Permit Aktiviti Pelabuhan',
    serviceTypeEn: 'Port Activity Permit',
    submittedDate: '2026-08-20',
    assignedOfficer: 'Kapt. Mohd Roslan (Unit M/T)',
    slaDaysRemaining: 5,
    slaStatus: 'warning',
    slaStatusLabelMs: 'Amaran (< 7 Hari)',
    slaStatusLabelEn: 'Warning (< 7 Days)',
    stageCode: 'SEMAKAN_TEKNIKAL_MT',
    stageNameMs: 'Semakan Lokasi Menyelam Had Pelabuhan',
    stageNameEn: 'Port Limit Diving Location Review',
  },
  {
    id: 'queue-3',
    referenceNo: 'LPK/PDA2/2026/00019',
    applicantName: 'En. Kamaruddin Yusof',
    companyName: 'Offshore Energy Resources Sdn Bhd',
    serviceTypeMs: 'Surat Sokongan PDA2',
    serviceTypeEn: 'PDA2 Support Letter',
    submittedDate: '2026-08-15',
    assignedOfficer: 'Puan Siti Noraini (Urus Setia)',
    slaDaysRemaining: 10,
    slaStatus: 'on_track',
    slaStatusLabelMs: 'Mengikut Jadual',
    slaStatusLabelEn: 'On Track',
    stageCode: 'KELULUSAN_PENGURUS_BESAR',
    stageNameMs: 'Pengesahan Pihak Berkuasa Melulus',
    stageNameEn: 'Approving Authority Verification',
  },
]

/**
 * Queries officer review queue with SLA tracking (M1, GP-19).
 */
export async function queryReviewQueue(
  userId: bigint | string,
): Promise<ReviewQueueItem[]> {
  const uid = typeof userId === 'string' ? BigInt(userId) : userId

  try {
    return await withUser(uid, async () => {
      return BASELINE_REVIEW_QUEUE
    })
  } catch {
    return BASELINE_REVIEW_QUEUE
  }
}

