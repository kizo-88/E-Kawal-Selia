# RLS verification harness

These need a live Postgres, so they are **not** part of `npm run verify`. Run them deliberately —
before a release, and after any change to a policy migration.

Findings from the last run: [`docs/evidence/G5-RLS/notes.md`](../../docs/evidence/G5-RLS/notes.md).

## Running

```bash
createdb kawalselia_verify
```

Apply every migration in `prisma/migrations/` in order, then create a role that the application will
connect as:

```sql
CREATE ROLE kawalselia_app LOGIN PASSWORD '...' NOBYPASSRLS;
GRANT USAGE ON SCHEMA public, app TO kawalselia_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO kawalselia_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO kawalselia_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO kawalselia_app;
```

Load the fixtures as the **owner**, then run the verification as the **app role**:

```bash
psql -U postgres -d kawalselia_verify -f tests/rls/fixtures.sql
```

```bash
psql -U kawalselia_app -d kawalselia_verify -f tests/rls/verify.sql
```

## Three ways this suite can lie to you

**1. Running it as the owner.** Postgres exempts table owners from row-level security. As `postgres`
every policy is skipped, every query returns every row, and nothing fails — a green run proving the
opposite of what it looks like. The suite's pre-flight prints `rolsuper`, `rolbypassrls` and
`tables_owned`; all three must be false/false/0 before any other line means anything.

**2. Treating "0 rows" as a pass.** Deny-by-default means a broken harness produces the same output
as a perfectly locked-down database. Every run must show at least one positive case returning rows.
Both harness bugs found on the first run had exactly this shape.

**3. Forgetting the transaction.** `set_config(..., true)` is transaction-local. Outside `BEGIN`/
`COMMIT`, psql autocommits and the setting is gone before the next query — every scenario silently
runs anonymous. This mirrors `withUser()` in `src/lib/db/scoped.ts`, which gets it right.

## Fixtures

Two officers in different units, two applicants, one colleague sharing an organisation, one full
admin. Two applications parked at different workflow stages, one supporting document, one active
licence and one revoked. Fake data only — never seed real applicant details.
