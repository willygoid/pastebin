-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pastes table (optional, GORM will auto-migrate)
CREATE TABLE IF NOT EXISTS pastes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    content TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'text',
    expires_at TIMESTAMP,
    views INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT FALSE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_pastes_created_at ON pastes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at);
