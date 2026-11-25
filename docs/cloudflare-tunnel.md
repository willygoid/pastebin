# Cloudflare Tunnel (opsional)

Compose utama **tidak membuka port host sama sekali** — Postgres, Redis,
backend, dan nginx hanya berkomunikasi di jaringan Docker. Ini menghindari
bentrok dengan nginx/aaPanel maupun app Docker lain di VPS. Untuk akses lokal,
pakai `docker-compose.local.yml`; untuk akses publik, pakai tunnel ini.

## Cara pakai

Cukup tambahkan dua baris ini ke `.env`:

```dotenv
USE_TUNNEL=false
CLOUDFLARE_TUNNEL_TOKEN=
```

- `USE_TUNNEL=false` (default) → container `cloudflared` menyala tapi idle
  (`sleep infinity`), jadi aman ikut `docker compose up` saat development.
- `USE_TUNNEL=true` → `cloudflared tunnel run` dijalankan dengan token tersebut.

## Menyiapkan tunnel

1. Di Cloudflare **Zero Trust → Networks → Tunnels → Create tunnel** (tipe
   *Cloudflared*), salin token-nya.
2. Isi `CLOUDFLARE_TUNNEL_TOKEN=<token>` dan set `USE_TUNNEL=true` di `.env`.
3. Di **Public Hostname**, arahkan ke service `http://nginx:80` (nama service
   Docker, bukan `localhost`).
4. Jalankan ulang: `docker compose up -d --remove-orphans`.

Cek: `docker compose ps` (container `pastebin_cloudflared` Up) lalu
`docker compose logs cloudflared`.

## Akses lokal tanpa tunnel

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d
# http://localhost:${NGINX_PORT:-8088}
```

`NGINX_PORT` default-nya `8088` agar tidak merebut port 80 milik aaPanel.

> Token bisa dikosongkan selama `USE_TUNNEL=false`. Jangan commit `.env` yang
> berisi token asli.
