export interface DashboardKpiItem {
  id: string
  labelMs: string
  labelEn: string
  value: string | number
  subtextMs: string
  subtextEn: string
  changeType: 'increase' | 'neutral' | 'alert'
  icon: 'file' | 'check' | 'alert' | 'ship' | 'shield'
}

export interface DashboardHistogramPoint {
  monthMs: string
  monthEn: string
  approved: number
  inReview: number
  rejected: number
  total: number
}

export const FIXTURE_DASHBOARD_HISTOGRAM: DashboardHistogramPoint[] = [
  { monthMs: 'Jan', monthEn: 'Jan', approved: 85, inReview: 12, rejected: 3, total: 100 },
  { monthMs: 'Feb', monthEn: 'Feb', approved: 92, inReview: 15, rejected: 4, total: 111 },
  { monthMs: 'Mac', monthEn: 'Mar', approved: 110, inReview: 20, rejected: 6, total: 136 },
  { monthMs: 'Apr', monthEn: 'Apr', approved: 125, inReview: 18, rejected: 5, total: 148 },
  { monthMs: 'Mei', monthEn: 'May', approved: 130, inReview: 22, rejected: 7, total: 159 },
  { monthMs: 'Jun', monthEn: 'Jun', approved: 140, inReview: 25, rejected: 5, total: 170 },
  { monthMs: 'Jul', monthEn: 'Jul', approved: 135, inReview: 20, rejected: 4, total: 159 },
  { monthMs: 'Ogo', monthEn: 'Aug', approved: 145, inReview: 28, rejected: 6, total: 179 },
  { monthMs: 'Sep', monthEn: 'Sep', approved: 0, inReview: 0, rejected: 0, total: 0 },
  { monthMs: 'Okt', monthEn: 'Oct', approved: 0, inReview: 0, rejected: 0, total: 0 },
  { monthMs: 'Nov', monthEn: 'Nov', approved: 0, inReview: 0, rejected: 0, total: 0 },
  { monthMs: 'Dis', monthEn: 'Dec', approved: 0, inReview: 0, rejected: 0, total: 0 },
]
