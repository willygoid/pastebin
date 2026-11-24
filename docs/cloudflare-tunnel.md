# Cloudflare Tunnel (opsional)

Aplikasi tetap bisa diakses lewat `http://localhost` tanpa tunnel. Tunnel hanya
dipakai kalau mau diekspos ke internet tanpa membuka port / SSL di VPS.

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

> Token bisa dikosongkan selama `USE_TUNNEL=false`. Jangan commit `.env` yang
> berisi token asli.
