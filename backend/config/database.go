package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"pastebin/app/models"
)

var DB *gorm.DB

func ConnectDatabase() {
	var err error

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_DB"),
		os.Getenv("POSTGRES_PORT"),
	)

	// Configure GORM with performance optimizations
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),

		// Performance optimizations
		PrepareStmt:            true, // Prepared statement caching
		SkipDefaultTransaction: true, // Disable default transaction for better performance

		// Connection pool settings will be configured below
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Get underlying SQL DB for connection pool configuration
	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatal("Failed to get database instance:", err)
	}

	// Connection Pool Settings
	// SetMaxIdleConns sets the maximum number of connections in the idle connection pool.
	sqlDB.SetMaxIdleConns(10)

	// SetMaxOpenConns sets the maximum number of open connections to the database.
	sqlDB.SetMaxOpenConns(100)

	// SetConnMaxLifetime sets the maximum amount of time a connection may be reused.
	sqlDB.SetConnMaxLifetime(time.Hour)

	// SetConnMaxIdleTime sets the maximum amount of time a connection may be idle.
	sqlDB.SetConnMaxIdleTime(10 * time.Minute)

	fmt.Println("Database connected successfully with optimized pool settings!")

	// Auto migrate models
	fmt.Println("Running database migrations...")
	err = DB.AutoMigrate(&models.Paste{})
	if err != nil {
		log.Printf("Warning: Migration error: %v", err)
	}

	// Create additional indexes manually for better performance
	createCustomIndexes()

	// Setup triggers
	setupTriggers()

	fmt.Println("Database migration and optimization completed!")
}

func createCustomIndexes() {
	// Composite index for common queries
	DB.Exec(`
		CREATE INDEX IF NOT EXISTS idx_pastes_active 
		ON pastes (is_private, deleted_at, created_at DESC) 
		WHERE deleted_at IS NULL
	`)

	// Index for expired pastes cleanup
	DB.Exec(`
		CREATE INDEX IF NOT EXISTS idx_pastes_expired 
		ON pastes (expires_at) 
		WHERE expires_at IS NOT NULL AND deleted_at IS NULL
	`)

	// Partial index for public pastes (most common query)
	DB.Exec(`
		CREATE INDEX IF NOT EXISTS idx_pastes_public 
		ON pastes (created_at DESC) 
		WHERE is_private = false AND deleted_at IS NULL
	`)

	// Index for popular pastes
	DB.Exec(`
		CREATE INDEX IF NOT EXISTS idx_pastes_popular 
		ON pastes (views DESC, created_at DESC) 
		WHERE is_private = false AND deleted_at IS NULL
	`)

	fmt.Println("Custom indexes created successfully!")
}

func setupTriggers() {
	// Create function first (if not exists)
	DB.Exec(`
		CREATE OR REPLACE FUNCTION update_updated_at_column()
		RETURNS TRIGGER AS $$
		BEGIN
			NEW.updated_at = CURRENT_TIMESTAMP;
			RETURN NEW;
		END;
		$$ language 'plpgsql'
	`)

	// Drop trigger if exists
	DB.Exec(`DROP TRIGGER IF EXISTS update_pastes_updated_at ON pastes`)

	// Create trigger
	DB.Exec(`
		CREATE TRIGGER update_pastes_updated_at 
		BEFORE UPDATE ON pastes
		FOR EACH ROW 
		EXECUTE FUNCTION update_updated_at_column()
	`)

	fmt.Println("Database triggers created successfully!")
}

// CleanupExpiredPastes - function to cleanup expired pastes
func CleanupExpiredPastes() error {
	return DB.Exec("SELECT cleanup_expired_pastes()").Error
}
