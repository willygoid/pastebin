package services

import (
	"encoding/json"
	"fmt"
	"time"

	"pastebin/app/models"
	"pastebin/app/repositories"
	"pastebin/config"
	"pastebin/utils"
)

type PasteService struct {
	repo *repositories.PasteRepository
}

func NewPasteService() *PasteService {
	return &PasteService{
		repo: repositories.NewPasteRepository(),
	}
}

func (s *PasteService) CreatePaste(paste *models.Paste) error {
	// Create paste first to get ID
	if err := s.repo.Create(paste); err != nil {
		return err
	}

	// Generate short ID from numeric ID
	paste.ShortID = utils.GenerateShortID(paste.ID)

	// If title is empty, use short ID as title
	if paste.Title == "" {
		paste.Title = paste.ShortID
	}

	// Update with short ID and title
	if err := s.repo.Update(paste); err != nil {
		return err
	}

	// Cache in Redis
	s.cacheSet(paste)
	return nil
}

func (s *PasteService) UpdatePasteTitle(shortID string, title string) error {
	paste, err := s.repo.FindByShortID(shortID)
	if err != nil {
		return err
	}

	paste.Title = title
	return s.repo.Update(paste)
}

func (s *PasteService) UpdatePasteContent(paste *models.Paste) error {
	// Update in database
	if err := s.repo.Update(paste); err != nil {
		return err
	}

	// Update cache
	s.cacheSet(paste)

	return nil
}

func (s *PasteService) GetPaste(shortID string) (*models.Paste, error) {
	// Try to get from cache first
	if paste, err := s.cacheGet(shortID); err == nil && paste != nil {
		s.repo.IncrementViews(shortID)
		return paste, nil
	}

	// Get from database
	paste, err := s.repo.FindByShortID(shortID)
	if err != nil {
		return nil, err
	}

	// Check expiration
	if paste.ExpiresAt != nil && paste.ExpiresAt.Before(time.Now()) {
		s.repo.Delete(shortID)
		s.cacheDelete(shortID)
		return nil, fmt.Errorf("paste has expired")
	}

	// Update views
	s.repo.IncrementViews(shortID)
	paste.Views++

	// Cache it
	s.cacheSet(paste)

	return paste, nil
}

func (s *PasteService) GetRecentPastes(limit int) ([]models.Paste, error) {
	return s.repo.FindAll(limit)
}

func (s *PasteService) DeletePaste(shortID string) error {
	s.cacheDelete(shortID)
	return s.repo.Delete(shortID)
}

func (s *PasteService) ClearCache(shortID string) {
	s.cacheDelete(shortID)
}

// Cache helpers
func (s *PasteService) cacheSet(paste *models.Paste) {
	key := fmt.Sprintf("paste:%s", paste.ShortID)
	data, _ := json.Marshal(paste)

	expiration := 24 * time.Hour
	if paste.ExpiresAt != nil {
		expiration = time.Until(*paste.ExpiresAt)
	}

	config.RedisClient.Set(config.Ctx, key, data, expiration)
}

func (s *PasteService) cacheGet(shortID string) (*models.Paste, error) {
	key := fmt.Sprintf("paste:%s", shortID)
	data, err := config.RedisClient.Get(config.Ctx, key).Result()
	if err != nil {
		return nil, err
	}

	var paste models.Paste
	if err := json.Unmarshal([]byte(data), &paste); err != nil {
		return nil, err
	}

	return &paste, nil
}

func (s *PasteService) cacheDelete(shortID string) {
	key := fmt.Sprintf("paste:%s", shortID)
	config.RedisClient.Del(config.Ctx, key)
}
