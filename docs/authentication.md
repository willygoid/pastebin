# PasteBin Application - Authentication System

Sistem autentikasi lengkap untuk aplikasi PasteBin dengan role-based access control (Admin & User).

## 🚀 Fitur

### Backend (Golang)
- ✅ User Registration & Login
- ✅ JWT Authentication
- ✅ Role-based Access Control (Admin & User)
- ✅ User Management (Admin only)
- ✅ Password Hashing dengan bcrypt
- ✅ Profile Management
- ✅ Password Change/Reset

### Frontend (Next.js)
- ✅ Halaman Login yang modern dan responsif
- ✅ Halaman Register dengan validasi lengkap
- ✅ Dashboard User dengan profile management
- ✅ Dashboard Admin dengan user management
- ✅ Protected Routes
- ✅ Toast Notifications
- ✅ Beautiful UI dengan Tailwind CSS

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (untuk development)
- Go 1.22+ (untuk development)

## 🔧 Setup

### 1. Clone & Setup Environment

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env dan sesuaikan konfigurasi
# Pastikan JWT_SECRET diubah untuk production!
```

### 2. Update .env File

Pastikan menambahkan JWT_SECRET di file .env Anda:

```bash
JWT_SECRET=your_very_secure_jwt_secret_key_change_this_in_production
```

### 3. Install Dependencies Backend

```bash
cd backend
go mod tidy
```

### 4. Install Dependencies Frontend

```bash
cd frontend
npm install
```

### 5. Run dengan Docker

```bash
# Build & run all services
docker-compose up -d

# Atau rebuild jika ada perubahan
docker-compose up -d --build
```

### 6. Akses Aplikasi

- Frontend: http://localhost:8088 (dengan `docker-compose.local.yml`)
- Backend API: http://localhost:8088/api
- API Health: http://localhost:8088/health

> Compose utama tidak membuka port host. Contoh `localhost:8080` di bawah
> berlaku hanya jika backend diekspos manual; di produksi gunakan `/api` lewat
> nginx atau domain Cloudflare Tunnel.

## 🔐 API Endpoints

### Public Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "user"  // optional: "user" or "admin", default: "user"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email_or_username": "johndoe",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

### Protected Endpoints (Requires JWT Token)

Header yang diperlukan:
```
Authorization: Bearer <your-jwt-token>
```

#### Get Profile
```
GET /api/profile
```

#### Update Profile
```
PUT /api/profile
Content-Type: application/json

{
  "full_name": "John Doe Updated",
  "email": "newemail@example.com"
}
```

#### Change Password
```
POST /api/change-password
Content-Type: application/json

{
  "old_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

### Admin Endpoints (Requires Admin Role)

#### Get All Users
```
GET /api/admin/users?page=1&limit=10
```

#### Get User by ID
```
GET /api/admin/users/:id
```

#### Update User Role
```
PUT /api/admin/users/:id/role
Content-Type: application/json

{
  "role": "admin"  // or "user"
}
```

#### Toggle User Status
```
PUT /api/admin/users/:id/toggle-status
```

#### Delete User
```
DELETE /api/admin/users/:id
```

#### Reset User Password
```
POST /api/admin/users/:id/reset-password
Content-Type: application/json

{
  "new_password": "newpassword123"
}
```

## 🎨 Frontend Routes

- `/login` - Halaman login
- `/register` - Halaman registrasi
- `/dashboard` - Dashboard user (protected, role: user)
- `/admin/dashboard` - Dashboard admin (protected, role: admin)

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user' NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);
```

## 🔒 Security Features

1. **Password Hashing**: Menggunakan bcrypt dengan cost factor default
2. **JWT Authentication**: Token berlaku selama 24 jam
3. **Role-based Access Control**: Admin dan User memiliki akses berbeda
4. **Protected Routes**: Frontend dan backend sama-sama di-protect
5. **Input Validation**: Validasi di backend menggunakan Gin binding

## 🧪 Testing

### Test dengan cURL

#### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "role": "user"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_username": "testuser",
    "password": "password123"
  }'
```

#### Get Profile (dengan token)
```bash
curl -X GET http://localhost:8080/api/profile \
  -H "Authorization: Bearer <your-token-here>"
```

## 📝 Development

### Backend Development

```bash
cd backend
go run main.go
```

### Frontend Development

```bash
cd frontend
npm run dev
```

## 🐛 Troubleshooting

### Issue: JWT errors di backend
**Solusi**: Pastikan JWT_SECRET sudah di-set di .env file

### Issue: Cannot connect to database
**Solusi**: 
1. Pastikan PostgreSQL container sudah running: `docker-compose ps`
2. Check logs: `docker-compose logs postgres`

### Issue: Frontend cannot connect to backend
**Solusi**: Pastikan NEXT_PUBLIC_API_URL di .env sesuai dengan backend URL

### Issue: 401 Unauthorized
**Solusi**: 
1. Check apakah token masih valid (expired setelah 24 jam)
2. Pastikan header Authorization sudah benar: `Bearer <token>`

## 📦 Production Deployment

1. Update semua environment variables di .env
2. Ganti JWT_SECRET dengan value yang secure
3. Ganti database passwords
4. Set GO_ENV=production
5. Set NODE_ENV=production
6. Setup SSL dengan Let's Encrypt
7. Run: `docker-compose up -d --build`

## 🎯 Next Steps

Fitur yang bisa ditambahkan:
- [ ] Email verification
- [ ] Forgot password functionality
- [ ] OAuth integration (Google, GitHub)
- [ ] User profile pictures
- [ ] Activity logs
- [ ] Two-factor authentication
- [ ] Rate limiting
- [ ] API documentation dengan Swagger

## 📄 License

MIT License

## 👨‍💻 Author

Created by Willy - PasteBin Application
