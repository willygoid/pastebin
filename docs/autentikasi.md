# 🔐 Sistem Autentikasi PasteBin

## ✅ Fitur yang Sudah Dibuat

### Backend (Golang)
1. ✅ **Model User** - dengan support role admin dan user
2. ✅ **Authentication API** 
   - Register (POST /api/auth/register)
   - Login (POST /api/auth/login)
   - Get Profile (GET /api/profile)
   - Update Profile (PUT /api/profile)
   - Change Password (POST /api/change-password)

3. ✅ **Admin API** (hanya untuk admin)
   - Get All Users (GET /api/admin/users)
   - Get User by ID (GET /api/admin/users/:id)
   - Update User Role (PUT /api/admin/users/:id/role)
   - Toggle User Status (PUT /api/admin/users/:id/toggle-status)
   - Delete User (DELETE /api/admin/users/:id)
   - Reset Password (POST /api/admin/users/:id/reset-password)

4. ✅ **Middleware**
   - JWT Authentication
   - Admin Authorization

5. ✅ **Security**
   - Password hashing dengan bcrypt
   - JWT token dengan expiry 24 jam
   - Role-based access control

### Frontend (Next.js)
1. ✅ **Halaman Login** (`/login`)
   - Design modern dengan gradient background
   - Form validation
   - Show/hide password
   - Redirect otomatis berdasarkan role

2. ✅ **Halaman Register** (`/register`)
   - Form lengkap (username, email, password, full name, role)
   - Password confirmation
   - Input validation
   - Beautiful UI

3. ✅ **Dashboard User** (`/dashboard`)
   - Menampilkan profil user
   - Edit profil
   - Stats cards
   - Protected route (hanya user biasa)

4. ✅ **Dashboard Admin** (`/admin/dashboard`)
   - User management table
   - Search users
   - Update role (admin/user)
   - Toggle user status (active/inactive)
   - Reset password
   - Delete user
   - Pagination
   - Protected route (hanya admin)

5. ✅ **Utilities**
   - API client dengan axios
   - Authentication service
   - Admin service
   - Toast notifications
   - JWT token management

## 🚀 Cara Menjalankan

### 1. Setup Environment
Pastikan file `.env` Anda sudah memiliki `JWT_SECRET`:

```bash
JWT_SECRET=your_very_secure_jwt_secret_key_change_this_in_production
```

### 2. Jalankan dengan Docker

```bash
# Build dan jalankan semua services
docker-compose up -d --build

# Atau jika sudah pernah build
docker-compose up -d
```

### 3. Cek Status Container

```bash
docker-compose ps
```

Semua container harus dalam status "running":
- pastebin_postgres
- pastebin_redis
- pastebin_backend
- pastebin_frontend
- pastebin_nginx

### 4. Buat User Admin Pertama

Setelah container running, buat admin user:

```bash
# Cara 1: Menggunakan script (recommended)
./scripts/seed-users.sh

# Cara 2: Manual dengan curl
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "full_name": "Admin",
    "role": "admin"
  }'
```

### 5. Akses Aplikasi

- **Frontend**: http://localhost:8088 (dengan `docker-compose.local.yml`)
- **Login**: http://localhost:8088/login
- **Register**: http://localhost:8088/register
- **Backend API**: http://localhost:8088/api

> Compose utama tidak membuka port host. Contoh `localhost:8080` di bawah
> berlaku hanya jika backend diekspos manual; di produksi gunakan `/api` lewat
> nginx atau domain Cloudflare Tunnel.

## 🧪 Testing

### Login sebagai Admin
1. Buka http://localhost/login
2. Login dengan:
   - Username: `admin`
   - Password: `admin123`
3. Akan redirect ke `/admin/dashboard`

### Login sebagai User
1. Buka http://localhost/login
2. Login dengan:
   - Username: `user1`
   - Password: `user123`
3. Akan redirect ke `/dashboard`

## 📋 Default Accounts (setelah run seed-users.sh)

### Admin
- Username: `admin`
- Email: `admin@pastebin.com`
- Password: `admin123`

### Users
- **User 1**
  - Username: `user1`
  - Email: `user1@pastebin.com`
  - Password: `user123`

- **User 2**
  - Username: `user2`
  - Email: `user2@pastebin.com`
  - Password: `user123`

- **User 3**
  - Username: `user3`
  - Email: `user3@pastebin.com`
  - Password: `user123`

## 🎯 Fitur Dashboard

### User Dashboard (`/dashboard`)
- ✅ Lihat profil pribadi
- ✅ Edit nama dan email
- ✅ Lihat statistik akun
- ✅ View role dan status

### Admin Dashboard (`/admin/dashboard`)
- ✅ Lihat semua users dengan pagination
- ✅ Search user (by username, email, atau nama)
- ✅ Update role user (admin ⟷ user)
- ✅ Toggle status user (active ⟷ inactive)
- ✅ Reset password user
- ✅ Delete user
- ✅ Statistik dashboard (total users, admins, active users)

## 🔐 Security Features

1. **Password Hashing**: Semua password di-hash dengan bcrypt
2. **JWT Tokens**: Token berlaku 24 jam, auto-refresh saat login
3. **Protected Routes**: 
   - `/dashboard` hanya bisa diakses user yang login
   - `/admin/dashboard` hanya bisa diakses admin
4. **Auto Logout**: Token expired otomatis logout dan redirect ke login
5. **CORS Protection**: Backend protected dengan CORS
6. **Role-based Access**: Admin dan user punya akses berbeda

## 🐛 Troubleshooting

### Problem: Cannot connect to API
**Solution**: 
- Cek backend container: `docker-compose logs backend`
- Pastikan backend running: `curl http://localhost:8080/health`

### Problem: Login redirect ke login lagi
**Solution**:
- Clear browser localStorage
- Check if JWT_SECRET sama di backend dan .env

### Problem: Database connection error
**Solution**:
- Restart postgres: `docker-compose restart postgres`
- Check logs: `docker-compose logs postgres`

### Problem: Frontend tidak muncul
**Solution**:
- Check frontend logs: `docker-compose logs frontend`
- Check nginx logs: `docker-compose logs nginx`
- Rebuild: `docker-compose up -d --build frontend`

## 📝 API Testing dengan cURL

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "full_name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_username": "testuser",
    "password": "test123"
  }'
```

### Get Profile (perlu token)
```bash
TOKEN="your-jwt-token-here"
curl -X GET http://localhost:8080/api/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Get All Users (admin only)
```bash
TOKEN="admin-jwt-token-here"
curl -X GET http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

## 📂 File Structure

```
pastebin-app/
├── backend/
│   ├── app/
│   │   ├── controllers/
│   │   │   ├── auth_controller.go    # Auth endpoints
│   │   │   ├── user_controller.go    # Admin user management
│   │   │   └── paste_controller.go   # Existing paste
│   │   ├── models/
│   │   │   ├── user.go               # User model
│   │   │   └── paste.go              # Existing paste
│   │   ├── repositories/
│   │   │   └── user_repository.go    # User DB operations
│   │   └── services/
│   │       ├── auth_service.go       # Auth business logic
│   │       └── user_service.go       # User management logic
│   ├── middleware/
│   │   └── auth.go                   # JWT & Admin middleware
│   └── utils/
│       ├── jwt.go                    # JWT utilities
│       └── password.go               # Password hashing
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── login/page.tsx        # Login page
│       │   ├── register/page.tsx     # Register page
│       │   ├── dashboard/page.tsx    # User dashboard
│       │   └── admin/
│       │       └── dashboard/page.tsx # Admin dashboard
│       └── lib/
│           ├── api.ts                # API client
│           └── auth.ts               # Auth services
└── scripts/
    ├── create-admin.sh               # Create first admin
    └── seed-users.sh                 # Seed sample users
```

## 🎨 UI Features

### Modern Design
- ✅ Gradient backgrounds
- ✅ Glassmorphism effects
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Beautiful cards & buttons
- ✅ Toast notifications
- ✅ Loading states
- ✅ Form validation feedback

### Color Schemes
- **Login**: Indigo to Purple gradient
- **Register**: Emerald to Teal gradient
- **User Dashboard**: Indigo to Purple theme
- **Admin Dashboard**: Blue to Indigo theme

## 🔄 Next Features to Implement

- [ ] Email verification
- [ ] Forgot password
- [ ] User profile pictures
- [ ] Activity logs
- [ ] 2FA (Two-factor authentication)
- [ ] Social login (Google, GitHub)
- [ ] User sessions management
- [ ] API rate limiting

## ✅ Checklist

- [x] Backend authentication setup
- [x] JWT implementation
- [x] User CRUD operations
- [x] Admin endpoints
- [x] Frontend login page
- [x] Frontend register page
- [x] User dashboard
- [x] Admin dashboard
- [x] Protected routes
- [x] Role-based access
- [x] Documentation
- [x] Helper scripts

---

**Selamat! Sistem autentikasi sudah siap digunakan!** 🎉
