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

func (r *PasteRepository) FindByShortID(shortID string) (*models.Paste, error) {
	var paste models.Paste
	err := config.DB.
		Where("short_id = ? AND deleted_at IS NULL", shortID).
		First(&paste).Error
	return &paste, err
}

func (r *PasteRepository) FindByID(id uint) (*models.Paste, error) {
	var paste models.Paste
	err := config.DB.Where("id = ?", id).First(&paste).Error
	return &paste, err
}

func (r *PasteRepository) Update(paste *models.Paste) error {
	return config.DB.Save(paste).Error
}

func (r *PasteRepository) FindAll(limit int) ([]models.Paste, error) {
	var pastes []models.Paste
	err := config.DB.
		Select("id, short_id, title, language, views, created_at").
		Where("is_private = ? AND deleted_at IS NULL", false).
		Order("created_at DESC").
		Limit(limit).
		Find(&pastes).Error
	return pastes, err
}

func (r *PasteRepository) FindPopular(limit int) ([]models.Paste, error) {
	var pastes []models.Paste
	err := config.DB.
		Select("id, short_id, title, language, views, created_at").
		Where("is_private = ? AND deleted_at IS NULL", false).
		Order("views DESC, created_at DESC").
		Limit(limit).
		Find(&pastes).Error
	return pastes, err
}

func (r *PasteRepository) IncrementViews(shortID string) error {
	return config.DB.Exec(
		"UPDATE pastes SET views = views + 1 WHERE short_id = ? AND deleted_at IS NULL",
		shortID,
	).Error
}

func (r *PasteRepository) Delete(shortID string) error {
	return config.DB.
		Model(&models.Paste{}).
		Where("short_id = ?", shortID).
		Update("deleted_at", gorm.Expr("NOW()")).Error
}

func (r *PasteRepository) HardDelete(shortID string) error {
	return config.DB.
		Unscoped().
		Where("short_id = ?", shortID).
		Delete(&models.Paste{}).Error
}

func (r *PasteRepository) CleanupExpired() (int64, error) {
	result := config.DB.
		Model(&models.Paste{}).
		Where("expires_at IS NOT NULL AND expires_at < NOW() AND deleted_at IS NULL").
		Update("deleted_at", gorm.Expr("NOW()"))
	return result.RowsAffected, result.Error
}
