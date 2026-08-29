import Link from 'next/link'
import {
  IconBuilding,
  IconExternalLink,
  IconMail,
  IconPhone,
  IconShield,
} from '../ui/icons'

export interface OrganisationInfo {

  nameMs: string
  nameEn: string
  secretariatMs: string
  secretariatEn: string
  addressLine1: string
  addressLine2: string
  postcode: string
  city: string
  stateCode: string
  coordinates: string
  phone: string
  email: string
  website: string
  goLiveYear: number
}

export const LPKMN_ORG_INFO: OrganisationInfo = {
  nameMs: 'Lembaga Pelabuhan Kemaman',
  nameEn: 'Kemaman Port Authority',
  secretariatMs: 'Urus Setia Pelesenan & Kawal Selia Pelabuhan',
  secretariatEn: 'Port Licensing & Regulatory Secretariat',
  addressLine1: 'Jalan Pelabuhan, Teluk Kalong',
  addressLine2: 'Peti Surat 66',
  postcode: '24007',
  city: 'Kemaman',
  stateCode: 'Terengganu Darul Iman',
  coordinates: '4.2486° N, 103.4567° E',
  phone: '+609-863 1590 / 1591',
  email: 'kawalselia@lpktg.gov.my',
  website: 'https://www.lpktg.gov.my',
  goLiveYear: 2026,
}

export function PublicFooter() {
  return (
    <footer className="w-full bg-[#07192f] text-slate-300 pt-12 pb-8 border-t-4 border-amber-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Column 1: LPKmn & e-Kawalselia info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white p-1 shadow-sm border border-slate-700 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-lpkmn.png"
                  alt="Logo Rasmi Lembaga Pelabuhan Kemaman"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  e-Kawalselia
                </span>
                <span className="block text-[11px] text-amber-400 font-medium">
                  {LPKMN_ORG_INFO.nameMs}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Portal rasmi perkhidmatan pelesenan, permit aktiviti maritim, sokongan PDA2, dan
              pengawasan kawal selia operasi Lembaga Pelabuhan Kemaman.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <IconShield className="h-4 w-4 shrink-0" />
              <span>Gerbang Keselamatan Kerajaan Malaysia</span>
            </div>
          </div>

          {/* Column 2: Alamat & Lokasi (GP-08 separate fields) */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <IconBuilding className="h-4 w-4 text-amber-400" />
              <span>Alamat &amp; Urus Setia</span>
            </h4>
            <div className="text-xs text-slate-400 space-y-1 leading-relaxed">
              <p className="font-medium text-slate-200">
                {LPKMN_ORG_INFO.secretariatMs}
              </p>
              <p>{LPKMN_ORG_INFO.nameMs}</p>
              <p>{LPKMN_ORG_INFO.addressLine1}</p>
              <p>{LPKMN_ORG_INFO.addressLine2}</p>
              <p>
                {LPKMN_ORG_INFO.postcode} {LPKMN_ORG_INFO.city}, {LPKMN_ORG_INFO.stateCode}
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Koordinat: {LPKMN_ORG_INFO.coordinates}
              </p>
            </div>
          </div>

          {/* Column 3: Hubungi Kami */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <IconPhone className="h-4 w-4 text-amber-400" />
              <span>Hubungi Kami</span>
            </h4>
            <div className="text-xs text-slate-400 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <IconPhone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{LPKMN_ORG_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <IconMail className="h-4 w-4 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${LPKMN_ORG_INFO.email}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {LPKMN_ORG_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <IconExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
                <a
                  href={LPKMN_ORG_INFO.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  Laman Web Rasmi LPKmn
                </a>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Waktu Operasi: Ahad – Rabu (8:00 PG – 5:00 PTG), Khamis (8:00 PG – 3:30 PTG)
              </p>
            </div>
          </div>

          {/* Column 4: Pautan Pantas & Polisi */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Pautan &amp; Polisi
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>
                <Link
                  href="/dasar-privasi"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Dasar Privasi &amp; Keselamatan</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/bantuan"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Manual Pengguna &amp; Meja Bantuan</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Log Masuk Sistem</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://www.lpktg.gov.my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Portal Rasmi LPKmn</span>
                  <IconExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar (GP-23) */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {LPKMN_ORG_INFO.goLiveYear} {LPKMN_ORG_INFO.nameMs} (LPKmn). Hak Cipta Terpelihara.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Versi Sistem 1.0 (P1)</span>
            <span>|</span>
            <span>Paparan Terbaik: Chrome / Edge / Firefox (1280×720+)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
