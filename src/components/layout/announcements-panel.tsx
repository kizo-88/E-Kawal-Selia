'use client'

import { useState } from 'react'
import { Badge } from '../ui/badge'
import {
  IconAlertCircle,
  IconCheckCircle,
  IconChevronDown,
  IconChevronUp,
  IconFileText,
  IconInfo,
} from '../ui/icons'


export interface AnnouncementItem {
  id: string
  type: 'pengumuman' | 'pekeliling' | 'berita' | 'faq'
  titleMs: string
  titleEn: string
  summaryMs: string
  summaryEn: string
  date: string
  categoryMs: string
  categoryEn: string
  refNo?: string
  isPinned?: boolean
}

export interface FaqItem {
  id: string
  questionMs: string
  questionEn: string
  answerMs: string
  answerEn: string
  categoryMs: string
  categoryEn: string
}

export const FIXTURE_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    type: 'pengumuman',
    titleMs: 'Pelaksanaan Penuh Sistem e-Kawalselia Mulai Suku Kedua 2026',
    titleEn: 'Full Implementation of e-Kawalselia System Starting Q2 2026',
    summaryMs:
      'Semua permohonan Lesen Perkhidmatan Sokongan, Permit Aktiviti Pelabuhan, dan Surat Sokongan PDA2 hendaklah dibuat secara dalam talian melalui portal e-Kawalselia.',
    summaryEn:
      'All applications for Support Service Licences, Port Activity Permits, and PDA2 Support Letters must be submitted online via the e-Kawalselia portal.',
    date: '2026-04-15',
    categoryMs: 'Pemberitahuan Rasmi',
    categoryEn: 'Official Notice',
    isPinned: true,
  },
  {
    id: 'ann-2',
    type: 'pekeliling',
    titleMs: 'Pekeliling Pelabuhan Bil. 03/2026: Prosedur Pembaharuan Lesen Perkhidmatan Marin',
    titleEn: 'Port Circular No. 03/2026: Renewal Procedures for Marine Service Licences',
    summaryMs:
      'Garis panduan dan senarai semak dokumen sokongan bagi pembaharuan lesen perkhidmatan sokongan pelabuhan di bawah peruntukan Akta Lembaga Pelabuhan.',
    summaryEn:
      'Guidelines and checklist of supporting documents for renewal of port support service licences under the Port Authorities Act.',
    date: '2026-03-20',
    categoryMs: 'Pekeliling Pelabuhan',
    categoryEn: 'Port Circular',
    refNo: 'LPK/PEK/2026/03',
  },
  {
    id: 'ann-3',
    type: 'berita',
    titleMs: 'Sesi Libat Urus LPKmn Bersama Persatuan Ejen Perkapalan Wilayah Timur',
    titleEn: 'LPKmn Engagement Session with Eastern Region Shipping Agents Association',
    summaryMs:
      'Sesi taklimat transformasi digital dan penyeragaman kadar fi perkhidmatan sokongan pelabuhan Kemaman telah diadakan dengan jayanya.',
    summaryEn:
      'Briefing session on digital transformation and standardisation of Kemaman port support service fees was successfully held.',
    date: '2026-03-10',
    categoryMs: 'Aktiviti Korporat',
    categoryEn: 'Corporate Activity',
  },
  {
    id: 'ann-4',
    type: 'pekeliling',
    titleMs: 'Pekeliling Keselamatan Zon Had Pelabuhan Kemaman (ISPS Code Compliance)',
    titleEn: 'Kemaman Port Limits Safety Circular (ISPS Code Compliance)',
    summaryMs:
      'Arahan pematuhan tahap keselamatan maritim bagi semua kapal komersial dan vesel sokongan luar pesisir (OSV) yang berlabuh di Pelabuhan Kemaman.',
    summaryEn:
      'Maritime security compliance directives for all commercial vessels and offshore support vessels (OSV) berthing at Port of Kemaman.',
    date: '2026-02-28',
    categoryMs: 'Keselamatan Pelabuhan',
    categoryEn: 'Port Security',
    refNo: 'LPK/ISPS/2026/01',
  },
]

export const FIXTURE_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    questionMs: 'Bagaimanakah syarikat saya boleh memohon Lesen Perkhidmatan Sokongan Pelabuhan?',
    questionEn: 'How can my company apply for a Port Support Service Licence?',
    answerMs:
      'Daftar akaun pengguna kategori Syarikat / Wakil Syarikat di portal ini. Log masuk dan pilih "Permohonan Baru > Lesen Perkhidmatan Sokongan". Lengkapkan borang berperingkat dan muat naik dokumen sokongan yang diperlukan.',
    answerEn:
      'Register a Company / Company Representative account on this portal. Log in and select "New Application > Support Service Licence". Complete the multi-step form and upload required supporting documents.',
    categoryMs: 'Pelesenan',
    categoryEn: 'Licensing',
  },
  {
    id: 'faq-2',
    questionMs: 'Berapa lamakah tempoh piagam pelanggan bagi kelulusan permohonan?',
    questionEn: 'What is the client charter duration for application approvals?',
    answerMs:
      'Kelulusan permohonan standard diproses dalam tempoh 14 hari bekerja dari tarikh dokumen lengkap diterima, tertakluk kepada semakan teknikal dan ulasan Unit Marin & Trafik.',
    answerEn:
      'Standard application approvals are processed within 14 working days from complete document submission, subject to technical review and Marine & Traffic Unit evaluation.',
    categoryMs: 'Proses & SLA',
    categoryEn: 'Process & SLA',
  },
  {
    id: 'faq-3',
    questionMs: 'Bagaimanakah cara untuk menyemak ketulenan lesen atau permit yang dikeluarkan?',
    questionEn: 'How can the authenticity of an issued licence or permit be verified?',
    answerMs:
      'Setiap lesen yang dijana mengandungi Kod QR rasmi. Anda boleh mengimbas Kod QR tersebut menggunakan kamera telefon atau memasukkan kod 32-aksara di halaman Semakan Awam tanpa perlu log masuk.',
    answerEn:
      'Every issued licence contains an official QR code. You may scan the QR code using your phone camera or enter the 32-character token on the Public Verification page without logging in.',
    categoryMs: 'Pengesahan QR',
    categoryEn: 'QR Verification',
  },
  {
    id: 'faq-4',
    questionMs: 'Apakah yang perlu dilakukan sekiranya terlupa kata laluan akaun?',
    questionEn: 'What should I do if I have forgotten my account password?',
    answerMs:
      'Klik pada pautan "Lupa Kata Laluan?" di skrin log masuk. Masukkan alamat emel rasmi berdaftar untuk menerima pautan penetapan semula kata laluan.',
    answerEn:
      'Click on the "Forgot Password?" link on the login screen. Enter your registered official email address to receive a secure password reset link.',
    categoryMs: 'Akaun & Keselamatan',
    categoryEn: 'Account & Security',
  },
]

type ActiveTab = 'semua' | 'pengumuman' | 'pekeliling' | 'berita' | 'faq'

interface TabOption {
  id: ActiveTab
  labelMs: string
  labelEn: string
}

const TAB_OPTIONS: TabOption[] = [
  { id: 'semua', labelMs: 'Semua Makluman', labelEn: 'All Updates' },
  { id: 'pengumuman', labelMs: 'Pengumuman', labelEn: 'Announcements' },
  { id: 'pekeliling', labelMs: 'Pekeliling', labelEn: 'Circulars' },
  { id: 'berita', labelMs: 'Berita LPKmn', labelEn: 'LPKmn News' },
  { id: 'faq', labelMs: 'Soalan Lazim (FAQ)', labelEn: 'FAQ' },
]

export function AnnouncementsPanel() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('semua')
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1')

  const filteredAnnouncements = FIXTURE_ANNOUNCEMENTS.filter((item) => {
    if (activeTab === 'semua') return true
    return item.type === activeTab
  })

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Panel Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#0b2545]/10 rounded-md text-[#0b2545]">
            <IconFileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Pusat Maklumat &amp; Pengumuman Rasmi
            </h3>
            <p className="text-xs text-slate-500">
              Notis pelabuhan, pekeliling semasa, dan panduan pelesenan LPKmn
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
          {TAB_OPTIONS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0b2545] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/90'
                }`}
              >
                {tab.labelMs}
              </button>
            )
          })}
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-6">
        {activeTab === 'faq' ? (
          /* FAQ List */
          <div className="space-y-3">
            {FIXTURE_FAQS.map((faq) => {
              const isExpanded = expandedFaq === faq.id
              return (
                <div
                  key={faq.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                    aria-expanded={isExpanded}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left font-medium text-sm text-slate-900 hover:bg-slate-100/70 cursor-pointer focus:outline-hidden"
                  >
                    <span className="flex items-center gap-2.5">
                      <IconInfo className="h-4 w-4 text-sky-600 shrink-0" />
                      <span>{faq.questionMs}</span>
                    </span>
                    <span className="text-slate-400 shrink-0">
                      {isExpanded ? (
                        <IconChevronUp className="h-4 w-4" />
                      ) : (
                        <IconChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  {isExpanded ? (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                      <p>{faq.answerMs}</p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-500 uppercase tracking-wider">
                          Kategori:
                        </span>
                        <span>{faq.categoryMs}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : (
          /* Announcements / Circulars / News List */
          <div className="space-y-4">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((item) => (
                <article
                  key={item.id}
                  className={`p-4 rounded-lg border transition-all ${
                    item.isPinned
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.type === 'pekeliling'
                            ? 'gold'
                            : item.type === 'pengumuman'
                              ? 'primary'
                              : 'default'
                        }
                        size="sm"
                      >
                        {item.categoryMs}
                      </Badge>
                      {item.refNo ? (
                        <span className="text-xs font-mono font-semibold text-slate-600">
                          {item.refNo}
                        </span>
                      ) : null}
                    </div>
                    <time className="text-xs text-slate-500 font-medium">
                      {item.date}
                    </time>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.titleMs}
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {item.summaryMs}
                  </p>
                </article>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                <IconAlertCircle className="h-6 w-6 text-slate-400" />
                <span>Tiada rekod makluman untuk kategori ini.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Panel Footer Ticker / Note (GP-17) */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Kemaskini maklumat berkala oleh Bahagian Korporat &amp; Unit Marin LPKmn</span>
        </div>
        <span className="hidden sm:inline text-[11px] text-slate-400">
          Tertakluk kepada Akta Lembaga Pelabuhan
        </span>
      </div>
    </div>
  )
}
