package repositories

import (
	"pastebin/app/models"
	"pastebin/config"

	"gorm.io/gorm"
)

type PasteRepository struct{}

func NewPasteRepository() *PasteRepository {
	return &PasteRepository{}
}

func (r *PasteRepository) Create(paste *models.Paste) error {
	return config.DB.Create(paste).Error
}

func (r *PasteRepository) FindByID(id string) (*models.Paste, error) {
	var paste models.Paste
	err := config.DB.Where("id = ?", id).First(&paste).Error
	return &paste, err
}

func (r *PasteRepository) Update(paste *models.Paste) error {
	return config.DB.Save(paste).Error
}

func (r *PasteRepository) Delete(id string) error {
	return config.DB.Delete(&models.Paste{}, "id = ?", id).Error
}

func (r *PasteRepository) FindAll(limit int) ([]models.Paste, error) {
	var pastes []models.Paste
	err := config.DB.
		Where("is_private = ?", false).
		Order("created_at DESC").
		Limit(limit).
		Find(&pastes).Error
	return pastes, err
}

func (r *PasteRepository) IncrementViews(id string) error {
	return config.DB.Model(&models.Paste{}).
		Where("id = ?", id).
		Update("views", gorm.Expr("views + ?", 1)).Error
}
