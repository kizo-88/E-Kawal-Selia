import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

import kawalselia from './eslint-rules/index.mjs'

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    ignores: ['.next/**', '.firebase/**', 'out/**', 'node_modules/**', 'src/generated/**', 'next-env.d.ts'],
  },


  /*
   * RULES.md, enforced.
   *
   * These are errors, not warnings. A warning is a rule nobody obeys under
   * deadline pressure, and this project has thirteen days of buffer.
   *
   * Each rule is tested in tests/rules.test.ts. A rule that silently stopped
   * matching is worse than no rule, because everyone assumes it still guards them.
   */
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    plugins: { kawalselia },
    rules: {
      'kawalselia/no-hardcoded-lists': 'error', // G1
      'kawalselia/no-hard-delete': 'error', // G2
      'kawalselia/no-generic-audit-label': 'error', // G3
      'kawalselia/require-bilingual': 'error', // G4
      'kawalselia/domain-stays-pure': 'error', // G7
      'kawalselia/no-direct-mail': 'error',
      'kawalselia/no-secrets-in-code': 'error',
    },
  },
]

export default eslintConfig
