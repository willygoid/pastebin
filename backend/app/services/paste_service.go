package services

import (
	"encoding/json"
	"fmt"
	"time"

	"pastebin/app/models"
	"pastebin/app/repositories"
	"pastebin/config"
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
	if err := s.repo.Create(paste); err != nil {
		return err
	}

	// Cache in Redis
	s.cacheSet(paste)
	return nil
}

func (s *PasteService) GetPaste(id string) (*models.Paste, error) {
	// Try to get from cache first
	if paste, err := s.cacheGet(id); err == nil && paste != nil {
		s.repo.IncrementViews(id)
		return paste, nil
	}

	// Get from database
	paste, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Check expiration
	if paste.ExpiresAt != nil && paste.ExpiresAt.Before(time.Now()) {
		s.repo.Delete(id)
		s.cacheDelete(id)
		return nil, fmt.Errorf("paste has expired")
	}

	// Update views
	s.repo.IncrementViews(id)
	paste.Views++

	// Cache it
	s.cacheSet(paste)

	return paste, nil
}

func (s *PasteService) GetRecentPastes(limit int) ([]models.Paste, error) {
	return s.repo.FindAll(limit)
}

func (s *PasteService) DeletePaste(id string) error {
	s.cacheDelete(id)
	return s.repo.Delete(id)
}

// Cache helpers
func (s *PasteService) cacheSet(paste *models.Paste) {
	key := fmt.Sprintf("paste:%s", paste.ID)
	data, _ := json.Marshal(paste)

	expiration := 24 * time.Hour
	if paste.ExpiresAt != nil {
		expiration = time.Until(*paste.ExpiresAt)
	}

	config.RedisClient.Set(config.Ctx, key, data, expiration)
}

func (s *PasteService) cacheGet(id string) (*models.Paste, error) {
	key := fmt.Sprintf("paste:%s", id)
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

func (s *PasteService) cacheDelete(id string) {
	key := fmt.Sprintf("paste:%s", id)
	config.RedisClient.Del(config.Ctx, key)
}
