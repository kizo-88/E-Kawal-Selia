# F8 — RLS Verified on Live Supabase

**Date:** 2026-08-25  
**Run against:** `aws-0-ap-northeast-1.pooler.supabase.com:6543` via `kawalselia_app` role

## Pre-flight (G5 mandatory)
| Check | Result |
|---|---|
| `rolsuper` | **false** ✅ |
| `rolbypassrls` | **false** ✅ |
| Tables owned by `kawalselia_app` | **0** ✅ |
| `USAGE` on `app` schema | Granted ✅ |

## Verification results
| Scenario | Result |
|---|---|
| RLS enabled on `applications` | `rowsecurity=true` ✅ |
| RLS enabled on `generated_documents` | `rowsecurity=true` ✅ |
| RLS enabled on `licences` | `rowsecurity=true` ✅ |
| Anonymous (no `current_user_id`) → `applications` | **0 rows** ✅ |
| Scoped user (id=1) → own applications | Policy `applications_read` with `polqual` active ✅ |
| Scoped user (id=999, different unit) | **0 rows** ✅ |

## Policies on `applications`
- `applications_insert` — allows inserts (qual not required)
- `applications_read` — restricts to user's own unit (qual present)
- `applications_update_own` — restricts updates to own records (qual present)

## Script
`scripts/f8-verify-rls.mjs` — re-run any time with:
```
DATABASE_URL="<pooler-url>" node --experimental-strip-types scripts/f8-verify-rls.mjs
```
