/**
 * Local ESLint rules that enforce RULES.md.
 *
 * A markdown file is advice. These are the same rules with teeth: they fail
 * `npm run lint`, which fails CI, which blocks the PR. That is deliberate —
 * this project is built by a rotating cast of interns and three different AI
 * coding tools, and none of them reliably read documentation.
 *
 * Every rule maps to a golden rule in RULES.md and, through it, to a clause in
 * the LPKmn Garis Panduan. If you are about to disable one, the disable comment
 * must carry a reason. Reviewers: an undocumented disable is a rejected PR.
 */

/**
 * ESLint hands rules an absolute path, tests hand them a relative one, and
 * Windows uses backslashes. Normalise once so every path check below reads the
 * obvious way and behaves identically in both places.
 */
const normalise = (filename) => String(filename ?? '').replace(/\\/g, '/')

const inDir = (filename, dir) => new RegExp(`(^|/)${dir}/`).test(normalise(filename))

const isTestFile = (filename) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(normalise(filename))

/** Config files list paths and globs, which are not business lists. */
const isConfigFile = (filename) => /\.config\.[cm]?[jt]s$/.test(normalise(filename))

/** Directories where a literal list is legitimate: seeds, tooling, enums. */
const LIST_ALLOWED = [
  'prisma',
  'eslint-rules',
  'scripts',
  'src/lib/enums', // behavioural enums — ADR 0002 permits these
]

const isStringLiteral = (node) =>
  node?.type === 'Literal' && typeof node.value === 'string'

// ─────────────────────────────────────────────────────────────────── G1
const noHardcodedLists = {
  meta: {
    type: 'problem',
    docs: { description: 'Business lists live in the lookup registry, not in code (G1)' },
    schema: [],
    messages: {
      hardcoded:
        'Hard-coded list of {{count}} strings. G1: every dropdown, status label and business list ' +
        'lives in lookup_values and is admin-editable. The Garis Panduan (slide 53) puts the cost ' +
        'of tearing this out on us. Add a lookup_type and seed it — see docs/04-data-model.md. ' +
        'If this genuinely is not a business list, disable this rule with a reason.',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename()
    if (isTestFile(filename) || isConfigFile(filename)) return {}
    if (LIST_ALLOWED.some((dir) => inDir(filename, dir))) return {}

    return {
      ArrayExpression(node) {
        const strings = node.elements.filter(isStringLiteral)
        if (strings.length < 3) return
        if (strings.length !== node.elements.length) return

        context.report({
          node,
          messageId: 'hardcoded',
          data: { count: String(strings.length) },
        })
      },
    }
  },
}

// ─────────────────────────────────────────────────────────────────── G2
const noHardDelete = {
  meta: {
    type: 'problem',
    docs: { description: 'Nothing is physically deleted (G2)' },
    schema: [],
    messages: {
      hardDelete:
        'prisma.{{model}}.{{method}}() physically removes rows. G2: deleting a user, a lookup value ' +
        'or an application must not break the historical records that reference it. Set deletedAt ' +
        'instead — see docs/adr/0003-soft-delete-and-snapshots.md. The only legitimate physical ' +
        'delete is the audit retention purge, which records itself in audit_purge_runs.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee
        if (callee?.type !== 'MemberExpression') return
        const method = callee.property?.name
        if (method !== 'delete' && method !== 'deleteMany') return

        const owner = callee.object
        if (owner?.type !== 'MemberExpression') return
        const root = owner.object
        if (root?.type !== 'Identifier') return
        if (!/^(prisma|db|tx)$/.test(root.name)) return

        context.report({
          node,
          messageId: 'hardDelete',
          data: { model: owner.property?.name ?? 'model', method },
        })
      },
    }
  },
}

// ─────────────────────────────────────────────────────────────────── G3
const GENERIC_ACTIONS = /^(update|delete|create|insert|edit|remove|save|change)$/i

const noGenericAuditLabel = {
  meta: {
    type: 'problem',
    docs: { description: 'Audit entries must read as sentences a human understands (G3)' },
    schema: [],
    messages: {
      generic:
        'Audit action "{{value}}" is exactly what GP-18 forbids. Write what actually happened: ' +
        'actionCode "PERMOHONAN_DILULUSKAN" with actionLabelMs "Permohonan Lesen Perkhidmatan ' +
        'Sokongan LPK/LPS/2026/00123 diluluskan oleh Ketua Unit M/T". An auditor has to read this.',
    },
  },
  create(context) {
    return {
      Property(node) {
        const key = node.key?.name ?? node.key?.value
        if (key !== 'actionCode' && key !== 'action_code') return
        if (!isStringLiteral(node.value)) return
        if (!GENERIC_ACTIONS.test(node.value.value)) return

        context.report({ node: node.value, messageId: 'generic', data: { value: node.value.value } })
      },
    }
  },
}

// ─────────────────────────────────────────────────────────────────── G4
const requireBilingual = {
  meta: {
    type: 'problem',
    docs: { description: 'User-facing strings ship in both languages (G4)' },
    schema: [],
    messages: {
      missingPair:
        '"{{present}}" has no matching "{{missing}}". G4: every user-facing string carries _ms and ' +
        '_en from day one. Phase 1 ships the UI in BM only, but X-R06 makes English contractual in ' +
        'Phase 2 and retrofitting it later costs three times as much.',
    },
  },
  create(context) {
    return {
      ObjectExpression(node) {
        const names = new Set(
          node.properties
            .filter((p) => p.type === 'Property')
            .map((p) => p.key?.name ?? p.key?.value)
            .filter((n) => typeof n === 'string'),
        )

        for (const property of node.properties) {
          if (property.type !== 'Property') continue
          const name = property.key?.name ?? property.key?.value
          if (typeof name !== 'string') continue

          const counterpart = name.endsWith('Ms')
            ? `${name.slice(0, -2)}En`
            : name.endsWith('En')
              ? `${name.slice(0, -2)}Ms`
              : name.endsWith('_ms')
                ? `${name.slice(0, -3)}_en`
                : name.endsWith('_en')
                  ? `${name.slice(0, -3)}_ms`
                  : null

          if (!counterpart || names.has(counterpart)) continue

          context.report({
            node: property,
            messageId: 'missingPair',
            data: { present: name, missing: counterpart },
          })
        }
      },
    }
  },
}

// ─────────────────────────────────────────────────────── notification bus
const MAIL_PACKAGES = /^(nodemailer|resend|@sendgrid\/mail|postmark|mailgun)/

const noDirectMail = {
  meta: {
    type: 'problem',
    docs: { description: 'Mail goes through the notification bus, never directly' },
    schema: [],
    messages: {
      direct:
        'Importing "{{pkg}}" here bypasses the notification bus. The bus resolves the user\'s channel ' +
        'preferences (GP-16), renders the BM or EN template (GP-10), queues the send and writes the ' +
        'audit row. Calling a mailer directly silently skips all four. Only src/lib/notifications/ ' +
        'may import a mail provider.',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename()
    if (inDir(filename, 'src/lib/notifications')) return {}

    return {
      ImportDeclaration(node) {
        const pkg = node.source.value
        if (typeof pkg !== 'string' || !MAIL_PACKAGES.test(pkg)) return
        context.report({ node, messageId: 'direct', data: { pkg } })
      },
    }
  },
}

// ────────────────────────────────────────────────────────────── layering
const FORBIDDEN_IN_DOMAIN = [/^next\//, /^next$/, /^react/, /^@\/app/, /^@\/components/]

const domainStaysPure = {
  meta: {
    type: 'problem',
    docs: { description: 'Dependencies point inward: app → domain → lib' },
    schema: [],
    messages: {
      leak:
        'src/domain must not import "{{pkg}}". Dependencies point inward (app → domain → lib), which ' +
        'is what lets the UI be replaced without rewriting business logic — and it is why this ' +
        'codebase survived being ported from Laravel. Put the framework code in src/app and call ' +
        'into a domain action.',
    },
  },
  create(context) {
    const filename = context.filename ?? context.getFilename()
    if (!inDir(filename, 'src/domain')) return {}

    return {
      ImportDeclaration(node) {
        const pkg = node.source.value
        if (typeof pkg !== 'string') return
        if (!FORBIDDEN_IN_DOMAIN.some((re) => re.test(pkg))) return
        context.report({ node, messageId: 'leak', data: { pkg } })
      },
    }
  },
}

// ────────────────────────────────────────────────────────────── security
const noSecretsInCode = {
  meta: {
    type: 'problem',
    docs: { description: 'No secrets in the repo — .env only' },
    schema: [],
    messages: {
      secret:
        'This looks like a hard-coded credential in "{{name}}". Secrets live in .env and nowhere else. ' +
        'Anything committed here is in git history permanently, and this repo is handed to LPKmn.',
    },
  },
  create(context) {
    const SUSPECT = /(secret|password|passwd|api_?key|apikey|token|credential)$/i
    return {
      VariableDeclarator(node) {
        const name = node.id?.name
        if (typeof name !== 'string' || !SUSPECT.test(name)) return
        if (!isStringLiteral(node.init)) return
        if (node.init.value.length < 8) return
        if (/^(process\.env|test|example|changeme|xxx)/i.test(node.init.value)) return

        context.report({ node, messageId: 'secret', data: { name } })
      },
    }
  },
}

const plugin = {
  rules: {
    'no-hardcoded-lists': noHardcodedLists,
    'no-hard-delete': noHardDelete,
    'no-generic-audit-label': noGenericAuditLabel,
    'require-bilingual': requireBilingual,
    'no-direct-mail': noDirectMail,
    'domain-stays-pure': domainStaysPure,
    'no-secrets-in-code': noSecretsInCode,
  },
}

export default plugin
