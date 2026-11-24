package services

import (
	"pastebin/app/models"
	"pastebin/app/repositories"
	"pastebin/utils"

	"gorm.io/gorm"
)

type UserService struct {
	userRepo *repositories.UserRepository
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{
		userRepo: repositories.NewUserRepository(db),
	}
}

// GetAllUsers retrieves all users with pagination (admin only)
func (s *UserService) GetAllUsers(limit, offset int) ([]models.User, int64, error) {
	return s.userRepo.GetAll(limit, offset)
}

// GetUserByID retrieves user by ID
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	return s.userRepo.FindByID(id)
}

// UpdateUserRole updates user role (admin only)
func (s *UserService) UpdateUserRole(userID uint, role models.UserRole) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}

	user.Role = role
	return s.userRepo.Update(user)
}

// ToggleUserStatus toggles user active status (admin only)
func (s *UserService) ToggleUserStatus(userID uint) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}

	user.IsActive = !user.IsActive
	return s.userRepo.Update(user)
}

// DeleteUser soft deletes a user (admin only)
func (s *UserService) DeleteUser(userID uint) error {
	return s.userRepo.Delete(userID)
}

// ResetPassword resets user password (admin only)
func (s *UserService) ResetPassword(userID uint, newPassword string) error {
	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	return s.userRepo.UpdatePassword(userID, hashedPassword)
}
