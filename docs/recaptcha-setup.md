# Panduan Setup reCAPTCHA

## Perubahan yang Dilakukan

### 1. Halaman Login & Register
- ✅ Desain selaras dengan home page (menggunakan theme system yang sama)
- ✅ Support dark/light mode (sync dengan home page)
- ✅ Responsive dan user-friendly
- ✅ Menghapus role selection dari register (otomatis jadi user)
- ✅ Menambahkan Google reCAPTCHA v2

### 2. Environment Variables

Tambahkan variable berikut ke file `.env` Anda:

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

**CATATAN PENTING:**
- Key di atas adalah **test key** dari Google reCAPTCHA yang hanya untuk development
- Untuk production, Anda harus mendapatkan key sendiri dari [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)

### 3. Cara Mendapatkan reCAPTCHA Key Production

1. Kunjungi: https://www.google.com/recaptcha/admin
2. Login dengan akun Google Anda
3. Klik tombol **+** untuk menambah site baru
4. Isi form:
   - **Label**: Nama aplikasi Anda (contoh: "Pastebin App")
   - **reCAPTCHA type**: Pilih **reCAPTCHA v2** → **"I'm not a robot" Checkbox**
   - **Domains**: Masukkan domain Anda (contoh: `yourdomain.com`)
5. Submit form
6. Copy **Site Key** yang diberikan
7. Paste ke file `.env` Anda:
   ```bash
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_production_site_key_here
   ```

### 4. Dependencies Baru

Package yang ditambahkan:
- `react-google-recaptcha`: ^3.1.0
- `@types/react-google-recaptcha`: ^2.1.9

### 5. Build & Deploy

Setelah menambahkan NEXT_PUBLIC_RECAPTCHA_SITE_KEY ke file `.env`, jalankan:

```bash
# Stop semua container
docker compose down

# Rebuild dan restart
docker compose up -d --build
```

### 6. Fitur reCAPTCHA

- reCAPTCHA akan muncul di halaman login dan register
- User harus menyelesaikan captcha sebelum bisa submit form
- Theme captcha akan otomatis menyesuaikan dengan dark/light mode aplikasi
- Form akan disabled sampai captcha terverifikasi

### 7. Testing

Untuk testing di development, Anda bisa gunakan test keys dari Google:

**Site Key (Test):**
```
6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

**Secret Key (Test) - untuk backend jika perlu:**
```
6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

Test keys ini akan selalu mengembalikan success, berguna untuk development.

---

## Troubleshooting

### Captcha tidak muncul?
- Pastikan `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` sudah ditambahkan ke `.env`
- Pastikan sudah rebuild aplikasi dengan `docker compose up -d --build`
- Clear browser cache

### Captcha gagal validasi?
- Untuk production, pastikan domain Anda sudah terdaftar di Google reCAPTCHA admin console
- Pastikan menggunakan Site Key yang benar (bukan Secret Key)

### Dark mode tidak sync?
- Theme disimpan di localStorage dengan key `theme`
- Pastikan localStorage tidak di-clear saat navigasi antar halaman
