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
└── docker-compose.yml
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

Atau manual: `docker compose up -d --build`.

Cloudflare Tunnel opsional: tambahkan `USE_TUNNEL=false` dan
`CLOUDFLARE_TUNNEL_TOKEN=` ke `.env` (lihat [docs/cloudflare-tunnel.md](docs/cloudflare-tunnel.md)).

Dokumentasi lainnya ada di [docs/README.md](docs/README.md).
