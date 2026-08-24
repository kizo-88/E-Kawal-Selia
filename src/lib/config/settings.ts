import 'server-only'

import { prisma } from '@/lib/db'

/**
 * The settings store — GP-07, GP-08, and the configurable half of GP-03.
 *
 * ADR 0002: anything LPKmn might reasonably want to change is data, not code.
 * That includes the security policy values. GP-03 asks for a 10-minute session
 * timeout *and* for it to be configurable, so a correct constant in a source
 * file still fails the requirement.
 *
 * Read through `getSetting`. Never read a setting by querying the table
 * directly — the cast and the fallback live here.
 */

/**
 * Known keys, with the type each one carries.
 *
 * This is a registry, not a business list: adding a key is a code change
 * because something in code has to consume it. Admins edit *values* through
 * the UI; only developers add new keys.
 */
export const SETTING_KEYS = {
  'system.name': 'string',
  'system.acronym': 'string',
  'system.logo_path': 'file',
  'system.banner_enabled': 'bool',
  'system.go_live_year': 'int',

  'organisation.name': 'string',
  'organisation.secretariat': 'string',
  'organisation.address_line1': 'string',
  'organisation.address_line2': 'string',
  'organisation.postcode': 'string',
  'organisation.city': 'string',
  'organisation.state': 'string',

  'format.date': 'string',
  'format.currency': 'string',
  'format.default_locale': 'string',

  'security.session_timeout_minutes': 'int',
  'security.lockout_threshold': 'int',
  'security.lockout_duration_minutes': 'int',
  'security.password_min_length': 'int',
  'security.password_max_length': 'int',
  'security.password_require_mixed_case': 'bool',
  'security.password_require_symbol': 'bool',
  'security.password_require_digit': 'bool',
  'security.mfa_required': 'bool',

  'audit.retention_days': 'int',

  'notification.email_enabled': 'bool',
} as const

export type SettingKey = keyof typeof SETTING_KEYS

/**
 * Used only when the settings table has not been seeded — a fresh database, or
 * a test. These are not the source of truth; `prisma/seed.ts` is. They exist so
 * a missing row degrades to a safe value rather than throwing during boot.
 *
 * Every security fallback here is the *strict* end of the range. If the table
 * is unreadable, the system should lock down, not open up.
 */
const FALLBACKS: Record<SettingKey, string> = {
  'system.name': 'e-Kawalselia',
  'system.acronym': 'eKS',
  'system.logo_path': '',
  'system.banner_enabled': 'true',
  'system.go_live_year': '2026',

  'organisation.name': 'Lembaga Pelabuhan Kemaman',
  'organisation.secretariat': '',
  'organisation.address_line1': '',
  'organisation.address_line2': '',
  'organisation.postcode': '',
  'organisation.city': '',
  'organisation.state': '',

  'format.date': 'd/m/Y',
  'format.currency': 'RM',
  'format.default_locale': 'ms',

  'security.session_timeout_minutes': '10',
  'security.lockout_threshold': '3',
  'security.lockout_duration_minutes': '15',
  'security.password_min_length': '12',
  'security.password_max_length': '128',
  'security.password_require_mixed_case': 'true',
  'security.password_require_symbol': 'true',
  'security.password_require_digit': 'true',
  'security.mfa_required': 'true',

  'audit.retention_days': '1095',

  'notification.email_enabled': 'false',
}

/**
 * Every value type a setting can carry.
 *
 * Deliberately not derived from SETTING_KEYS: that would narrow to whatever
 * types happen to be in use today, and adding the first 'json' setting would
 * then fail to compile in castRaw rather than just working.
 */
type SettingType = 'string' | 'int' | 'bool' | 'json' | 'file'

type Cast<T extends SettingType> = T extends 'int'
  ? number
  : T extends 'bool'
    ? boolean
    : T extends 'json'
      ? unknown
      : string

function castRaw(type: SettingType, raw: string): unknown {
  switch (type) {
    case 'int': {
      const parsed = Number.parseInt(raw, 10)
      return Number.isNaN(parsed) ? 0 : parsed
    }
    case 'bool':
      return raw === 'true' || raw === '1'
    case 'json':
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    default:
      return raw
  }
}

export function castSetting<T extends SettingType>(type: T, raw: string): Cast<T> {
  return castRaw(type, raw) as Cast<T>
}

/**
 * Settings change rarely and are read on nearly every request, so they are
 * cached per process. `invalidateSettings()` must be called by any code that
 * writes one — the admin screen does this.
 */
let cache: Map<string, string> | null = null

async function load(): Promise<Map<string, string>> {
  if (cache) return cache

  const rows = await prisma.setting.findMany({
    where: { deletedAt: null },
    select: { key: true, value: true },
  })

  cache = new Map(rows.map((r) => [r.key, r.value ?? '']))
  return cache
}

export function invalidateSettings(): void {
  cache = null
}

export async function getSetting<K extends SettingKey>(
  key: K,
): Promise<Cast<(typeof SETTING_KEYS)[K]>> {
  const settings = await load()
  const raw = settings.get(key) ?? FALLBACKS[key]
  return castSetting(SETTING_KEYS[key], raw) as Cast<(typeof SETTING_KEYS)[K]>
}

/**
 * The security policy, resolved in one call.
 *
 * Auth code needs all of these together on every login attempt, and reading
 * them one at a time invites someone to forget one and hard-code it instead.
 */
export async function getSecurityPolicy() {
  return {
    session: {
      timeoutMinutes: await getSetting('security.session_timeout_minutes'),
    },
    lockout: {
      threshold: await getSetting('security.lockout_threshold'),
      durationMinutes: await getSetting('security.lockout_duration_minutes'),
    },
    password: {
      minLength: await getSetting('security.password_min_length'),
      maxLength: await getSetting('security.password_max_length'),
      requireMixedCase: await getSetting('security.password_require_mixed_case'),
      requireSymbol: await getSetting('security.password_require_symbol'),
      requireDigit: await getSetting('security.password_require_digit'),
    },
    mfaRequired: await getSetting('security.mfa_required'),
  }
}
