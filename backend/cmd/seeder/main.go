package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"

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

	fmt.Println("Running database seeder...")

	// Seed default admin user
	seedAdmin()

	// Seed default regular user
	seedUser()

	fmt.Println("Database seeding completed successfully!")
}

func seedAdmin() {
	// Check if admin already exists
	var existingAdmin models.User
	if err := config.DB.Where("email = ?", "admin@pastebin.com").First(&existingAdmin).Error; err == nil {
		fmt.Println("Admin user already exists, skipping...")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash admin password: %v", err)
	}

	admin := models.User{
		Username: "admin",
		Email:    "admin@pastebin.com",
		Password: string(hashedPassword),
		FullName: "System Administrator",
		Role:     models.RoleAdmin,
		IsActive: true,
	}

	if err := config.DB.Create(&admin).Error; err != nil {
		log.Fatalf("Failed to create admin user: %v", err)
	}

	fmt.Println("✓ Admin user created successfully")
	fmt.Println("  Email: admin@pastebin.com")
	fmt.Println("  Password: admin123")
	fmt.Println("  Username: admin")
}

func seedUser() {
	// Check if user already exists
	var existingUser models.User
	if err := config.DB.Where("email = ?", "user@pastebin.com").First(&existingUser).Error; err == nil {
		fmt.Println("Regular user already exists, skipping...")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("user123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash user password: %v", err)
	}

	user := models.User{
		Username: "testuser",
		Email:    "user@pastebin.com",
		Password: string(hashedPassword),
		FullName: "Test User",
		Role:     models.RoleUser,
		IsActive: true,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		log.Fatalf("Failed to create regular user: %v", err)
	}

	fmt.Println("✓ Regular user created successfully")
	fmt.Println("  Email: user@pastebin.com")
	fmt.Println("  Password: user123")
	fmt.Println("  Username: testuser")
}
