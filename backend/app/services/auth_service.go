package services

import (
	"errors"
	"pastebin/app/models"
	"pastebin/app/repositories"
	"pastebin/utils"

	"gorm.io/gorm"
)

type AuthService struct {
	userRepo *repositories.UserRepository
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{
		userRepo: repositories.NewUserRepository(db),
	}
}

// Register creates a new user account
func (s *AuthService) Register(username, email, password, fullName string, role models.UserRole) (*models.User, error) {
	// Check if email already exists
	existingUser, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("email already registered")
	}

	// Check if username already exists
	existingUsername, err := s.userRepo.FindByUsername(username)
	if err != nil {
		return nil, err
	}
	if existingUsername != nil {
		return nil, errors.New("username already taken")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		Username: username,
		Email:    email,
		Password: hashedPassword,
		FullName: fullName,
		Role:     role,
		IsActive: true,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

// Login authenticates a user and returns a JWT token
func (s *AuthService) Login(emailOrUsername, password string) (string, *models.User, error) {
	// Try to find user by email first
	user, err := s.userRepo.FindByEmail(emailOrUsername)
	if err != nil {
		return "", nil, err
	}

	// If not found by email, try username
	if user == nil {
		user, err = s.userRepo.FindByUsername(emailOrUsername)
		if err != nil {
			return "", nil, err
		}
	}

	// User not found
	if user == nil {
		return "", nil, errors.New("invalid credentials")
	}

	// Check if user is active
	if !user.IsActive {
		return "", nil, errors.New("account is inactive")
	}

	// Verify password
	if !utils.CheckPasswordHash(password, user.Password) {
		return "", nil, errors.New("invalid credentials")
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Username, string(user.Role))
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

// GetUserByID retrieves user by ID
func (s *AuthService) GetUserByID(id uint) (*models.User, error) {
	return s.userRepo.FindByID(id)
}

// UpdateProfile updates user profile
func (s *AuthService) UpdateProfile(userID uint, fullName, email string) (*models.User, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, err
	}

	// Check if new email is already taken by another user
	if email != user.Email {
		existingUser, err := s.userRepo.FindByEmail(email)
		if err != nil {
			return nil, err
		}
		if existingUser != nil && existingUser.ID != userID {
			return nil, errors.New("email already in use")
		}
		user.Email = email
	}

	user.FullName = fullName

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}

// ChangePassword changes user password
func (s *AuthService) ChangePassword(userID uint, oldPassword, newPassword string) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}

	// Verify old password
	if !utils.CheckPasswordHash(oldPassword, user.Password) {
		return errors.New("invalid old password")
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	return s.userRepo.UpdatePassword(userID, hashedPassword)
}
