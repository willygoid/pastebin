#!/usr/bin/env bash

set -euo pipefail

# Selalu jalankan dari root repo, bukan dari folder tempat script dipanggil.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE=".env"
TEMPLATE=".env.example"
INSTALLED_MARKER=".installed"

fail() {
    echo "❌ $*" >&2
    exit 1
}

# Installer hanya boleh jalan sekali. Marker dipakai supaya reinstall tetap
# ditolak walau .env sengaja dihapus.
if [[ -e "$ENV_FILE" || -e "$INSTALLED_MARKER" ]]; then
    if [[ -e "$ENV_FILE" && -e "$INSTALLED_MARKER" ]]; then
        fail "Pastefel sudah terinstall (.env dan $INSTALLED_MARKER sudah ada). Installer hanya untuk instalasi pertama."
    elif [[ -e "$ENV_FILE" ]]; then
        fail "Pastefel sudah terinstall (.env sudah ada). Hapus .env dan $INSTALLED_MARKER hanya jika memang ingin install ulang dari nol."
    else
        fail "Pastefel sudah terinstall ($INSTALLED_MARKER sudah ada). Installer hanya untuk instalasi pertama."
    fi
fi

[[ -f "$TEMPLATE" ]] || fail "Template $TEMPLATE tidak ditemukan."

echo "========================================="
echo "  Pastefel - First Time Installer"
echo "========================================="
echo ""
echo "Tekan Enter untuk menerima nilai default."
echo ""

generate_secret() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -hex 32
    else
        LC_ALL=C head -c 48 /dev/urandom | base64 | tr -d '/+=\n'
    fi
}

ask() {
    local label="$1" default="$2" value=""
    read -r -p "$label [$default]: " value || true
    printf '%s' "${value:-$default}"
}

# Nilai yang ditulis ke .env tidak boleh mengandung karakter yang diparsing
# oleh dotenv/shell ($ " ' \ ` spasi) atau yang merusak DATABASE_URL (@ / ? :).
valid_setting() {
    [[ "$1" =~ ^[A-Za-z0-9_.+=:/?-]+$ ]]
}

valid_secret() {
    [[ "$1" =~ ^[A-Za-z0-9_-]+$ ]]
}

valid_token() {
    [[ "$1" =~ ^[A-Za-z0-9_=-]+$ ]]
}

ask_setting() {
    local label="$1" default="$2" value
    while true; do
        value="$(ask "$label" "$default")"
        if valid_setting "$value"; then
            printf '%s' "$value"
            return
        fi
        echo "   ⚠️  Hanya huruf, angka, titik, underscore, plus, dan minus yang diperbolehkan." >&2
        default="$2"
    done
}

ask_secret() {
    local label="$1" generated="$2" value=""
    echo "$label" >&2
    echo "   Otomatis: $generated" >&2
    read -r -p "   Override (kosongkan untuk pakai otomatis): " value || true
    if [[ -z "$value" ]]; then
        printf '%s' "$generated"
        return
    fi
    while ! valid_secret "$value"; do
        echo "   ⚠️  Hanya huruf, angka, underscore, dan minus yang diperbolehkan." >&2
        read -r -p "   Override (kosongkan untuk pakai otomatis): " value || true
        if [[ -z "$value" ]]; then
            printf '%s' "$generated"
            return
        fi
    done
    printf '%s' "$value"
}

ask_port() {
    local label="$1" default="$2" value
    while true; do
        value="$(ask "$label" "$default")"
        if [[ "$value" =~ ^[0-9]+$ ]] && (( value >= 1 && value <= 65535 )); then
            printf '%s' "$value"
            return
        fi
        echo "   ⚠️  Port harus angka antara 1 dan 65535." >&2
        default="$2"
    done
}

ask_number() {
    local label="$1" default="$2" value
    while true; do
        value="$(ask "$label" "$default")"
        if [[ "$value" =~ ^[0-9]+$ ]]; then
            printf '%s' "$value"
            return
        fi
        echo "   ⚠️  Nilai harus angka." >&2
        default="$2"
    done
}

ask_yes_no() {
    local label="$1" default="$2" value answer
    while true; do
        value="$(ask "$label (y/n)" "$default")"
        answer="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"
        case "$answer" in
            y|yes) printf 'true';  return ;;
            n|no)  printf 'false'; return ;;
        esac
        echo "   ⚠️  Jawab y atau n." >&2
        default="$2"
    done
}

echo "📝 Konfigurasi aplikasi"
app_name="$(ask_setting 'Nama aplikasi (APP_NAME)' 'pastebin')"
app_env="$(ask_setting 'Environment (APP_ENV)' 'production')"
app_port="$(ask_port 'Port frontend (APP_PORT)' '3000')"
backend_port="$(ask_port 'Port backend (BACKEND_PORT)' '8080')"
go_env="$(ask_setting 'Environment Go (GO_ENV)' 'production')"

echo ""
echo "🔑 Secret (di-generate otomatis, bisa di-override)"
jwt_secret="$(ask_secret 'JWT_SECRET' "$(generate_secret)")"
postgres_password="$(ask_secret 'POSTGRES_PASSWORD' "$(generate_secret)")"
redis_password="$(ask_secret 'REDIS_PASSWORD' "$(generate_secret)")"

echo ""
echo "🗄️  Database & Redis"
postgres_user="$(ask_setting 'User PostgreSQL' 'pastebin_user')"
postgres_db="$(ask_setting 'Nama database' 'pastebin_db')"
postgres_host="$(ask_setting 'Host PostgreSQL' 'postgres')"
postgres_port="$(ask_port 'Port PostgreSQL' '5432')"
redis_host="$(ask_setting 'Host Redis' 'redis')"
redis_port="$(ask_port 'Port Redis' '6379')"
redis_db="$(ask_number 'Database Redis' '0')"

echo ""
echo "🌐 Frontend & proxy"
api_url="$(ask_setting 'NEXT_PUBLIC_API_URL' '/api')"
recaptcha_key="$(ask_setting 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY' '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI')"
nginx_port="$(ask_port 'Port nginx untuk akses lokal (NGINX_PORT)' '8088')"

echo ""
echo "☁️  Cloudflare Tunnel (opsional)"
use_tunnel="$(ask_yes_no 'Aktifkan tunnel?' 'n')"
if [[ "$use_tunnel" == "true" ]]; then
    while true; do
        read -r -p "CLOUDFLARE_TUNNEL_TOKEN: " tunnel_token || true
        if [[ -n "$tunnel_token" ]] && valid_token "$tunnel_token"; then
            break
        fi
        echo "   ⚠️  Token wajib diisi (huruf, angka, _, -, =)." >&2
    done
else
    tunnel_token=""
fi

# Salin template, lalu timpa Only baris kunci yang dipilih. Baris lain
# (komentar dan DATABASE_URL dengan ${VAR}) dipertahankan apa adanya.
tmp_env="$(mktemp "${ENV_FILE}.XXXXXX")"
trap 'rm -f "$tmp_env"' EXIT

awk \
    -v app_name="$app_name" \
    -v app_env="$app_env" \
    -v app_port="$app_port" \
    -v backend_port="$backend_port" \
    -v go_env="$go_env" \
    -v jwt_secret="$jwt_secret" \
    -v postgres_user="$postgres_user" \
    -v postgres_password="$postgres_password" \
    -v postgres_db="$postgres_db" \
    -v postgres_host="$postgres_host" \
    -v postgres_port="$postgres_port" \
    -v redis_host="$redis_host" \
    -v redis_port="$redis_port" \
    -v redis_password="$redis_password" \
    -v redis_db="$redis_db" \
    -v api_url="$api_url" \
    -v recaptcha_key="$recaptcha_key" \
    -v nginx_port="$nginx_port" \
    -v use_tunnel="$use_tunnel" \
    -v tunnel_token="$tunnel_token" \
'
/^APP_NAME=/            { print "APP_NAME=" app_name; next }
/^APP_ENV=/             { print "APP_ENV=" app_env; next }
/^APP_PORT=/            { print "APP_PORT=" app_port; next }
/^BACKEND_PORT=/        { print "BACKEND_PORT=" backend_port; next }
/^GO_ENV=/              { print "GO_ENV=" go_env; next }
/^JWT_SECRET=/          { print "JWT_SECRET=" jwt_secret; next }
/^POSTGRES_USER=/       { print "POSTGRES_USER=" postgres_user; next }
/^POSTGRES_PASSWORD=/   { print "POSTGRES_PASSWORD=" postgres_password; next }
/^POSTGRES_DB=/         { print "POSTGRES_DB=" postgres_db; next }
/^POSTGRES_HOST=/       { print "POSTGRES_HOST=" postgres_host; next }
/^POSTGRES_PORT=/       { print "POSTGRES_PORT=" postgres_port; next }
/^REDIS_HOST=/          { print "REDIS_HOST=" redis_host; next }
/^REDIS_PORT=/          { print "REDIS_PORT=" redis_port; next }
/^REDIS_PASSWORD=/      { print "REDIS_PASSWORD=" redis_password; next }
/^REDIS_DB=/            { print "REDIS_DB=" redis_db; next }
/^NEXT_PUBLIC_API_URL=/ { print "NEXT_PUBLIC_API_URL=" api_url; next }
/^NEXT_PUBLIC_RECAPTCHA_SITE_KEY=/ { print "NEXT_PUBLIC_RECAPTCHA_SITE_KEY=" recaptcha_key; next }
/^NGINX_PORT=/          { print "NGINX_PORT=" nginx_port; next }
/^USE_TUNNEL=/          { print "USE_TUNNEL=" use_tunnel; next }
/^CLOUDFLARE_TUNNEL_TOKEN=/ { print "CLOUDFLARE_TUNNEL_TOKEN=" tunnel_token; next }
{ print }
' "$TEMPLATE" > "$tmp_env"

mv "$tmp_env" "$ENV_FILE"
trap - EXIT
touch "$INSTALLED_MARKER"

echo ""
echo "✅ Instalasi pertama selesai. File $ENV_FILE dan $INSTALLED_MARKER dibuat."
echo ""
echo "Credential yang di-generate:"
echo "   POSTGRES_USER=$postgres_user"
echo "   POSTGRES_PASSWORD=$postgres_password"
echo "   REDIS_PASSWORD=$redis_password"
echo "   JWT_SECRET=$jwt_secret"
echo ""
echo "Simpan credential tersebut. $ENV_FILE tidak masuk git."

if [[ "$(ask_yes_no 'Jalankan docker compose up -d --build sekarang?' 'n')" == "true" ]]; then
    if docker compose version >/dev/null 2>&1; then
        compose=(docker compose)
    elif command -v docker-compose >/dev/null 2>&1; then
        compose=(docker-compose)
    else
        fail "Docker Compose tidak ditemukan. Jalankan manual nanti: docker compose up -d --build"
    fi
    "${compose[@]}" up -d --build
    echo ""
    echo "🌐 Aplikasi: http://localhost"
else
    echo ""
    echo "Langkah berikutnya: docker compose up -d --build"
fi
