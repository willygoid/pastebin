#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

fail() {
    echo "❌ $*" >&2
    exit 1
}

ask_yes_no() {
    local label="$1" default="$2" value answer
    while true; do
        read -r -p "$label (y/n) [$default]: " value || true
        value="${value:-$default}"
        answer="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"
        case "$answer" in
            y|yes) printf 'true'; return ;;
            n|no)  printf 'false'; return ;;
        esac
        echo "   ⚠️  Jawab y atau n." >&2
    done
}

echo "========================================="
echo "  Pastefel - Update Deployment"
echo "========================================="
echo ""

# Update hanya untuk instalasi yang sudah berjalan (env sudah ada).
[[ -f ".env" ]] || fail ".env tidak ditemukan. Jalankan ./scripts/install.sh dulu."

set -a
. ./.env
set +a

if docker compose version > /dev/null 2>&1; then
    compose=(docker compose)
elif command -v docker-compose > /dev/null 2>&1; then
    compose=(docker-compose)
else
    fail "Docker Compose tidak ditemukan."
fi

git rev-parse --is-inside-work-tree > /dev/null 2>&1 || fail "Folder ini bukan git repository."

if [[ -n "$(git status --porcelain)" ]]; then
    fail "Working tree tidak bersih. Commit/stash perubahan lokal dulu sebelum update."
fi

branch="$(git symbolic-ref --quiet --short HEAD || true)"
if [[ -z "$branch" ]]; then
    branch="main"
    echo "ℹ️  HEAD dalam keadaan detached, akan pakai cabang main."
    git checkout "$branch"
fi

echo "📥 Fetch origin..."
git fetch --prune origin

git rev-parse --verify --quiet "refs/remotes/origin/$branch" > /dev/null \
    || fail "Cabang origin/$branch tidak ditemukan."

echo "⬆️  Fast-forward $branch ke origin/$branch..."
git pull --ff-only origin "$branch"

if [[ "$(ask_yes_no 'Backup database sebelum rebuild?' 'y')" == "true" ]]; then
    if [[ -x "./scripts/backup-database.sh" ]]; then
        ./scripts/backup-database.sh
    else
        echo "⚠️  scripts/backup-database.sh tidak ada/ tidak executable, backup dilewati."
    fi
fi

echo ""
echo "🔨 Rebuild dan recreate container (tanpa menghapus volume)..."
"${compose[@]}" up -d --build --force-recreate --remove-orphans

echo ""
echo "⏳ Menunggu health check..."
ready=false
for i in {1..30}; do
    if "${compose[@]}" exec -T nginx wget -qO- http://localhost/health > /dev/null 2>&1; then
        ready=true
        break
    fi
    echo "   Waiting... ($i/30)"
    sleep 2
done

if [[ "$ready" != "true" ]]; then
    echo ""
    echo "❌ Health check gagal. Log terakhir:" >&2
    "${compose[@]}" logs --tail=40 >&2 || true
    exit 1
fi

echo ""
echo "✅ Update selesai."
"${compose[@]}" ps
echo ""
echo "Akses: domain Cloudflare Tunnel, atau http://localhost:${NGINX_PORT:-8088} bila memakai docker-compose.local.yml."
