-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- Note: User is created automatically by POSTGRES_USER environment variable
-- But we need to ensure permissions are granted after tables are created by GORM AutoMigrate
-- This script runs before GORM, so we'll only create the helper functions here

-- Grant default permissions (will be applied after user is created)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'pastebin_user') THEN
        GRANT ALL PRIVILEGES ON DATABASE pastebin_db TO pastebin_user;
        GRANT ALL PRIVILEGES ON SCHEMA public TO pastebin_user;
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pastebin_user;
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pastebin_user;
        GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO pastebin_user;
    END IF;
END
$$;

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function untuk auto-cleanup expired pastes
CREATE OR REPLACE FUNCTION cleanup_expired_pastes()
RETURNS void AS $$
BEGIN
    DELETE FROM pastes 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;
