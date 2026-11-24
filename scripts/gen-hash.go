package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Generate hash for admin123
	adminHash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	fmt.Println("Admin password hash (admin123):")
	fmt.Println(string(adminHash))
	fmt.Println()

	// Generate hash for user123
	userHash, _ := bcrypt.GenerateFromPassword([]byte("user123"), bcrypt.DefaultCost)
	fmt.Println("User password hash (user123):")
	fmt.Println(string(userHash))
}
