package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	"pastebin/app/models"
	"pastebin/config"
)

func main() {
	// Load .env file in development
	if os.Getenv("GO_ENV") != "production" {
		if err := godotenv.Load("../.env"); err != nil {
			log.Println("No .env file found")
		}
	}

	// Initialize database
	config.ConnectDatabase()

	fmt.Println("WARNING: This will drop all tables and recreate them!")
	fmt.Println("Press CTRL+C to cancel, or any key to continue...")

	// Wait for user input
	var input string
	fmt.Scanln(&input)

	fmt.Println("Rolling back database...")

	// Drop all tables
	if err := config.DB.Migrator().DropTable(&models.User{}, &models.Paste{}); err != nil {
		log.Fatalf("Failed to drop tables: %v", err)
	}

	fmt.Println("✓ All tables dropped successfully")

	// Recreate tables
	fmt.Println("Running fresh migrations...")
	if err := config.DB.AutoMigrate(&models.Paste{}, &models.User{}); err != nil {
		log.Fatalf("Failed to migrate: %v", err)
	}

	fmt.Println("✓ Tables recreated successfully")
	fmt.Println("\nDatabase rolled back and reset successfully!")
	fmt.Println("Run the seeder to populate default accounts:")
	fmt.Println("  cd backend/cmd/seeder && go run main.go")
}
