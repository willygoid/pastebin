# Pastefel

Pastebin app dengan backend Go, frontend Next.js, PostgreSQL, Redis, dan nginx.

## Struktur folder

```text
.
├── backend/     # API Go (cmd, config, middleware, routes, app/{controllers,models,repositories,services}, utils)
├── database/    # Schema SQL (init) dan data awal (seeds)
├── docker/      # Dockerfile cloudflared untuk tunnel opsional
├── docs/        # Dokumentasi dan aset gambar pendukung (assets/)
├── frontend/    # Aplikasi Next.js (app router, components, lib, public)
├── nginx/       # Konfigurasi reverse proxy (HTTP, tanpa domain/SSL)
├── scripts/     # Script setup, seed, backup/restore, dan quick-start
├── tools/kiosk/ # Aplikasi kiosk browser (Go + Lorca)
├── docker-compose.yml       # Base: tanpa port host (aman di VPS/aaPanel)
└── docker-compose.local.yml # Opsional: buka nginx untuk akses lokal
```

## Menjalankan

Instalasi pertama (interaktif: membuat `.env`, secret di-generate otomatis,
dan menolak jika sudah terinstall):

```bash
./scripts/install.sh
```

Jika `.env` sudah dibuat manual:

```bash
./scripts/quick-start.sh
```

Manual/produksi — **tidak membuka port host sama sekali** (Postgres, Redis,
backend, dan nginx tetap internal; aman berdampingan dengan aaPanel/app Docker
lain). Akses publik lewat Cloudflare Tunnel ke `http://nginx:80`:

```bash
docker compose up -d --build
```

Akses lokal tanpa tunnel (membuka nginx di `NGINX_PORT`, default `8088`):

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
# http://localhost:8088
```

Cloudflare Tunnel opsional: tambahkan `USE_TUNNEL=false` dan
`CLOUDFLARE_TUNNEL_TOKEN=` ke `.env` (lihat [docs/cloudflare-tunnel.md](docs/cloudflare-tunnel.md)).

Dokumentasi lainnya ada di [docs/README.md](docs/README.md).
