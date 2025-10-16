# abyss_db\scripts\dev-db.sh

#!/usr/bin/env bash
set -euo pipefail

# ----------------------------
# Usage & Flags
# ----------------------------
# Env flags (can be exported or placed in .env):
#   DATABASE_URL              e.g. mysql://root:root@localhost:3330/abyss_db
#   SKIP_PUSH=true            skip `prisma db push`
#   SKIP_SEED=true            skip seeding
#   OPEN_STUDIO=true          open Prisma Studio after seeding
#   WAIT_RETRIES=30           how many wait attempts for MySQL
#   WAIT_DELAY_MS=2000        delay (ms) between wait attempts
#   PUSH_RETRIES=5            prisma db push retry attempts
#   SEED_RETRIES=3            seed retry attempts
#   STUDIO_PORT=5555          port for Prisma Studio (with OPEN_STUDIO=true)
#
# CLI options:
#   --skip-push               same as SKIP_PUSH=true
#   --skip-seed               same as SKIP_SEED=true
#   --open-studio             same as OPEN_STUDIO=true
#   --help                    show usage

usage() {
  cat <<'USAGE'
dev-db.sh - Bring the DB up to date for local dev

Options:
  --skip-push     Skip `prisma db push`
  --skip-seed     Skip seeding
  --open-studio   Open Prisma Studio after success
  --help          Show this help

Env:
  DATABASE_URL         (required) mysql://user:pass@host:port/db
  SKIP_PUSH            true|false (default: false)
  SKIP_SEED            true|false (default: false)
  OPEN_STUDIO          true|false (default: false)
  WAIT_RETRIES         integer    (default: 30)
  WAIT_DELAY_MS        integer    (default: 2000)
  PUSH_RETRIES         integer    (default: 5)
  SEED_RETRIES         integer    (default: 3)
  STUDIO_PORT          integer    (default: 5555)
USAGE
}

# ----------------------------
# Parse CLI args
# ----------------------------
SKIP_PUSH="${SKIP_PUSH:-false}"
SKIP_SEED="${SKIP_SEED:-false}"
OPEN_STUDIO="${OPEN_STUDIO:-false}"

for arg in "$@"; do
  case "$arg" in
    --skip-push) SKIP_PUSH=true ;;
    --skip-seed) SKIP_SEED=true ;;
    --open-studio) OPEN_STUDIO=true ;;
    --help) usage; exit 0 ;;
    *) echo "Unknown option: $arg" >&2; usage; exit 1 ;;
  esac
done

# ----------------------------
# Load .env (if present)
# ----------------------------
if [ -f ".env" ]; then
  # shellcheck disable=SC1091
  . ".env"
fi

# ----------------------------
# Sanity checks
# ----------------------------
if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL is not set. Set it in .env or environment." >&2
  exit 1
fi

# Defaults
WAIT_RETRIES="${WAIT_RETRIES:-30}"
WAIT_DELAY_MS="${WAIT_DELAY_MS:-2000}"
PUSH_RETRIES="${PUSH_RETRIES:-5}"
SEED_RETRIES="${SEED_RETRIES:-3}"
STUDIO_PORT="${STUDIO_PORT:-5555}"

# ----------------------------
# Helpers
# ----------------------------
retry() {
  # retry <attempts> <delay_seconds> <command...>
  attempts="$1"; shift
  delay="$1"; shift

  n=1
  until "$@"; do
    if [ "$n" -ge "$attempts" ]; then
      echo "❌ Command failed after $attempts attempts: $*" >&2
      return 1
    fi
    echo "↻ Retry $n/$attempts failed. Retrying in ${delay}s…" >&2
    n=$((n+1))
    sleep "$delay"
  done
}

# ----------------------------
# 1) Wait for MySQL
# ----------------------------
echo "⏳ Waiting for MySQL to be ready…"
# The mjs script should support env-driven target (e.g., DATABASE_URL)
# and internal retry logic; we pass retries/delay via env.
export WAIT_RETRIES WAIT_DELAY_MS
node scripts/wait-for-mysql.mjs

echo "✅ MySQL is ready."

# ----------------------------
# 2) Generate Prisma client & engines
# ----------------------------

echo "🧩 Ensuring Prisma client & engines are generated…"
npx prisma generate


# ----------------------------
# 3) prisma db push (optional)
# ----------------------------
if [ "$SKIP_PUSH" != "true" ]; then
  echo "📤 Applying schema with \`prisma db push\` (with retries)…"
  retry "$PUSH_RETRIES" 2 npx prisma db push
  echo "✅ Schema applied."
else
  echo "⏭️  Skipping prisma db push (SKIP_PUSH=true)"
fi

# ----------------------------
# 4) Seed database (optional)
# ----------------------------
if [ "$SKIP_SEED" != "true" ]; then
  echo "🌱 Seeding database…"
  retry "$SEED_RETRIES" 2 npm run prisma:seed
  echo "✅ Seed complete."
else
  echo "⏭️  Skipping seed (SKIP_SEED=true)"
fi

# ----------------------------
# 5) Open Prisma Studio (optional)
# ----------------------------
if [ "$OPEN_STUDIO" = "true" ]; then
  echo "🪟 Opening Prisma Studio on port ${STUDIO_PORT}… (Ctrl+C to stop)"
  exec npx prisma studio --port "$STUDIO_PORT"
fi

echo "🎉 DB ready for development."
