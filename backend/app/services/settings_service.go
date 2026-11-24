package services

import (
	"pastebin/app/models"
	"pastebin/config"
)

type SettingsService struct{}

func NewSettingsService() *SettingsService {
	return &SettingsService{}
}

// Get returns the single app settings row, creating it if it doesn't exist yet.
func (s *SettingsService) Get() (*models.AppSettings, error) {
	var settings models.AppSettings
	if err := config.DB.FirstOrCreate(&settings, models.AppSettings{ID: 1}).Error; err != nil {
		return nil, err
	}
	return &settings, nil
}

type UpdateSettingsInput struct {
	GoogleClientID     *string
	GoogleClientSecret *string
	GithubClientID     *string
	GithubClientSecret *string
}

// Update applies only the provided (non-nil) fields, leaving the rest untouched.
// This lets the admin update one credential without having to resend the others.
func (s *SettingsService) Update(input UpdateSettingsInput) (*models.AppSettings, error) {
	settings, err := s.Get()
	if err != nil {
		return nil, err
	}

	if input.GoogleClientID != nil {
		settings.GoogleClientID = *input.GoogleClientID
	}
	if input.GoogleClientSecret != nil && *input.GoogleClientSecret != "" {
		settings.GoogleClientSecret = *input.GoogleClientSecret
	}
	if input.GithubClientID != nil {
		settings.GithubClientID = *input.GithubClientID
	}
	if input.GithubClientSecret != nil && *input.GithubClientSecret != "" {
		settings.GithubClientSecret = *input.GithubClientSecret
	}

	if err := config.DB.Save(settings).Error; err != nil {
		return nil, err
	}

	return settings, nil
}
