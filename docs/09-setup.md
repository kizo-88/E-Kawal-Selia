# 09 — Local Setup

Follow this exactly. If a step fails, fix it before continuing — a half-configured environment
produces bugs that look like code bugs and burn a day of the lead's time.

---

## 1. Prerequisites

**Windows** (what the team runs). Install [Scoop](https://scoop.sh) first, then:

```bash
scoop install php composer nodejs git
```

You also need **Docker Desktop** running, for PostgreSQL and Redis.

Verify:

```bash
php -v && composer --version && node -v && docker info --format "{{.ServerVersion}}"
```

Expect PHP 8.5+, Composer 2.10+, Node 22+.

---

## 2. PHP extensions

The Windows PHP build ships with no `php.ini`, so none of the extensions Laravel needs are on.
Create `~/scoop/apps/php/current/php.ini` containing:

```ini
extension_dir = "ext"

extension=mbstring
extension=openssl
extension=curl
extension=fileinfo
extension=zip
extension=intl
extension=exif
extension=sodium
extension=gd
extension=pdo_pgsql
extension=pgsql
extension=pdo_sqlite
extension=sqlite3

memory_limit = 512M
upload_max_filesize = 32M
post_max_size = 40M
date.timezone = Asia/Kuala_Lumpur

[opcache]
opcache.enable_cli = 0
```

Check `pdo_pgsql` is present — without it nothing connects to the database:

```bash
php -m | grep pdo_pgsql
```

---

## 3. Project

```bash
git clone https://github.com/kizo-88/E-Kawal-Selia.git
```

```bash
cd E-Kawal-Selia && composer install && npm install
```

```bash
cp .env.example .env && php artisan key:generate
```

---

## 4. Services

```bash
docker compose up -d
```

That gives you three things:

| Service | Where | What for |
|---|---|---|
| PostgreSQL 16 + PostGIS | `localhost:5432` | The database. PostGIS is there for Phase 2 geofencing. |
| Redis 7 | `localhost:6379` | Queue and cache |
| Mailpit | http://localhost:8025 | **Catches every outgoing email.** Nothing can reach a real applicant from your machine. |

---

## 5. Database

```bash
php artisan migrate --seed
```

---

## 6. Run it

Two terminals:

```bash
php artisan serve
```

```bash
npm run dev
```

App at http://localhost:8000.

---

## 7. Before every commit

```bash
./vendor/bin/pint
```

```bash
php artisan test
```

Both must be clean. CI runs the same two commands and will reject the PR otherwise.

---

## Troubleshooting

**`could not find driver`** — `pdo_pgsql` is not enabled. Go back to step 2 and confirm
`php --ini` reports a loaded configuration file. If it says `(none)`, your `php.ini` is in the wrong
directory.

**`SQLSTATE[08006] connection refused`** — Docker is not running, or `docker compose up -d` was never
run. Check with `docker ps`.

**Architecture tests fail on a new file** — every PHP file under `app/` needs
`declare(strict_types=1);` on the second line. See `tests/Architecture/LayeringTest.php`.

**`App\Domain` must not use `App\Filament`** — you put business logic in the wrong layer.
Read `docs/03-architecture.md` §3. Move the logic into an Action under `app/Domain/**`.

---

## Rules that are not negotiable

1. **Never point your `.env` at a real LPKmn database.** Seeded fake data only, on every machine
   except production.
2. **Never paste real applicant data into an AI tool** — no names, IC numbers, company details or
   uploaded documents. See `CLAUDE.md` §9.
3. **Never commit `.env`.** It is gitignored; keep it that way.
4. `php artisan migrate:fresh` drops everything. Local only. Never staging, never production.
