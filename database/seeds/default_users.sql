-- Database Seeder for Default Accounts
-- Run this with: docker-compose exec postgres psql -U willy -d pastebin_db -f /path/to/seed.sql

-- Delete existing default accounts if they exist
DELETE FROM users WHERE email IN ('admin@pastebin.com', 'user@pastebin.com');

-- Insert admin user
-- Email: admin@pastebin.com
-- Password: admin123
-- Bcrypt hash of "admin123"
INSERT INTO users (username, email, password, full_name, role, is_active, created_at, updated_at)
VALUES (
    'admin',
    'admin@pastebin.com',
    '$2a$10$8K1p/9bMHlO6YSXE92VMqO8FZkpLEjUKg3QjWm9D6Pn.vLp0XYDLq',
    'System Administrator',
    'admin',
    true,
    NOW(),
    NOW()
);

-- Insert regular user
-- Email: user@pastebin.com  
-- Password: user123
-- Bcrypt hash of "user123"
INSERT INTO users (username, email, password, full_name, role, is_active, created_at, updated_at)
VALUES (
    'normaluser',
    'user@pastebin.com',
    '$2a$10$NqJqKpL5p3kL8dCQgKVGOeaP4qiQLQ5N1gMZNj8BQqF7UHxU8LJFi',
    'Regular User',
    'user',
    true,
    NOW(),
    NOW()
);

-- Display created accounts
SELECT id, username, email, role, is_active, created_at 
FROM users 
WHERE email IN ('admin@pastebin.com', 'user@pastebin.com')
ORDER BY role DESC;
