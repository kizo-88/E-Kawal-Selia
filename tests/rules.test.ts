import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import kawalselia from '../eslint-rules/index.mjs'

/**
 * The rules in RULES.md are only real if they fire. A rule that silently
 * stopped matching is worse than no rule, because everyone assumes it is
 * still guarding them. So: every rule gets a violation that must be caught
 * and a clean case that must not be.
 */

const linter = new Linter()

function lint(code: string, rule: string, filename = 'src/domain/example.ts') {
  return linter.verify(
    code,
    [
      {
        // Flat config needs an explicit matcher, or Linter.verify silently
        // applies nothing and every assertion passes for the wrong reason.
        files: ['**/*.{js,mjs,ts,tsx}'],
        plugins: { kawalselia: kawalselia as never },
        rules: { [`kawalselia/${rule}`]: 'error' },
        languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
      },
    ],
    filename,
  )
}

const catches = (code: string, rule: string, filename?: string) =>
  lint(code, rule, filename).length

describe('G1 — no hard-coded business lists', () => {
  it('catches an array of options in code', () => {
    expect(catches(`const negeri = ['Johor', 'Kedah', 'Kelantan']`, 'no-hardcoded-lists')).toBe(1)
  })

  it('allows it in seeds, where the lookup registry is populated', () => {
    expect(
      catches(`const negeri = ['Johor', 'Kedah', 'Kelantan']`, 'no-hardcoded-lists', 'prisma/seed.ts'),
    ).toBe(0)
  })

  it('leaves short arrays and non-string arrays alone', () => {
    expect(catches(`const pair = ['a', 'b']`, 'no-hardcoded-lists')).toBe(0)
    expect(catches(`const nums = [1, 2, 3, 4]`, 'no-hardcoded-lists')).toBe(0)
  })
})

describe('G2 — nothing is physically deleted', () => {
  it('catches a hard delete', () => {
    expect(catches(`await prisma.user.delete({ where: { id } })`, 'no-hard-delete')).toBe(1)
    expect(catches(`await prisma.lookupValue.deleteMany({ where: {} })`, 'no-hard-delete')).toBe(1)
  })

  it('allows the soft-delete equivalent', () => {
    expect(
      catches(
        `await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })`,
        'no-hard-delete',
      ),
    ).toBe(0)
  })
})

describe('G3 — audit entries read as sentences', () => {
  it('catches the generic labels GP-18 names explicitly', () => {
    expect(catches(`const e = { actionCode: 'update' }`, 'no-generic-audit-label')).toBe(1)
    expect(catches(`const e = { actionCode: 'delete' }`, 'no-generic-audit-label')).toBe(1)
  })

  it('allows a real action code', () => {
    expect(catches(`const e = { actionCode: 'PERMOHONAN_DILULUSKAN' }`, 'no-generic-audit-label')).toBe(0)
  })
})

describe('G4 — bilingual from day one', () => {
  it('catches a Malay label with no English counterpart', () => {
    expect(catches(`const t = { labelMs: 'Lulus' }`, 'require-bilingual')).toBe(1)
  })

  it('catches it in the other direction too', () => {
    expect(catches(`const t = { nameEn: 'Approved' }`, 'require-bilingual')).toBe(1)
  })

  it('allows a complete pair', () => {
    expect(catches(`const t = { labelMs: 'Lulus', labelEn: 'Approved' }`, 'require-bilingual')).toBe(0)
  })

  it('handles snake_case pairs', () => {
    expect(catches(`const t = { label_ms: 'Lulus' }`, 'require-bilingual')).toBe(1)
    expect(catches(`const t = { label_ms: 'Lulus', label_en: 'Approved' }`, 'require-bilingual')).toBe(0)
  })
})

describe('notification bus', () => {
  it('catches a mailer imported outside the bus', () => {
    expect(catches(`import nodemailer from 'nodemailer'`, 'no-direct-mail')).toBe(1)
  })

  it('allows it inside the bus', () => {
    expect(
      catches(`import nodemailer from 'nodemailer'`, 'no-direct-mail', 'src/lib/notifications/email.ts'),
    ).toBe(0)
  })
})

describe('layering — dependencies point inward', () => {
  it('catches the domain reaching for framework code', () => {
    expect(catches(`import { redirect } from 'next/navigation'`, 'domain-stays-pure')).toBe(1)
    expect(catches(`import { Button } from '@/components/ui/button'`, 'domain-stays-pure')).toBe(1)
  })

  it('leaves the app layer free to import anything', () => {
    expect(
      catches(`import { redirect } from 'next/navigation'`, 'domain-stays-pure', 'src/app/page.tsx'),
    ).toBe(0)
  })
})

describe('security — no secrets in the repo', () => {
  it('catches a hard-coded credential', () => {
    expect(catches(`const apiKey = 'sk_live_9f2a8b1c4d'`, 'no-secrets-in-code')).toBe(1)
  })

  it('allows reading it from the environment', () => {
    expect(catches(`const apiKey = process.env.SUPABASE_KEY`, 'no-secrets-in-code')).toBe(0)
  })
})
