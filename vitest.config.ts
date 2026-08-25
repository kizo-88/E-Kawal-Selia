import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

/**
 * `server-only` is a build-time guard, not a runtime one.
 *
 * The package throws on import so that a bundler fails loudly when server code
 * is pulled into a client bundle — which is exactly what it should do, and how
 * the `pg`-in-the-browser leak was caught. Vitest is neither a server nor a
 * client bundle, so it hits the throw and the module cannot be tested at all.
 *
 * Aliasing it to an empty stub keeps the guard doing its real job in `next
 * build` while letting tests import the modules it protects. Do NOT "fix" a
 * server-only error by deleting the import from the source file.
 */
export default defineConfig({
  resolve: {
    alias: {
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
  },
})
