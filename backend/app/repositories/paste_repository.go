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

// GetAllByUser returns the pastes owned by a specific user, with pagination and optional search
func (r *PasteRepository) GetAllByUser(userID uint, limit, offset int, search string) ([]models.Paste, int64, error) {
	var pastes []models.Paste
	var total int64

	filter := func(db *gorm.DB) *gorm.DB {
		db = db.Model(&models.Paste{}).Where("deleted_at IS NULL AND user_id = ?", userID)
		if search != "" {
			like := "%" + search + "%"
			db = db.Where("title ILIKE ? OR short_id ILIKE ?", like, like)
		}
		return db
	}

	if err := filter(config.DB).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := filter(config.DB).
		Select("id, short_id, title, language, views, is_private, expires_at, user_id, created_at").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&pastes).Error

	return pastes, total, err
}

// IsOwnedBy checks whether the paste with the given short ID belongs to userID
func (r *PasteRepository) IsOwnedBy(shortID string, userID uint) (bool, error) {
	var count int64
	err := config.DB.Model(&models.Paste{}).
		Where("short_id = ? AND user_id = ? AND deleted_at IS NULL", shortID, userID).
		Count(&count).Error
	return count > 0, err
}

// GetAllAdmin returns all pastes (including private ones) with pagination and optional search, for admin use
func (r *PasteRepository) GetAllAdmin(limit, offset int, search string) ([]models.Paste, int64, error) {
	var pastes []models.Paste
	var total int64

	filter := func(db *gorm.DB) *gorm.DB {
		db = db.Model(&models.Paste{}).Where("deleted_at IS NULL")
		if search != "" {
			like := "%" + search + "%"
			db = db.Where("title ILIKE ? OR short_id ILIKE ?", like, like)
		}
		return db
	}

	if err := filter(config.DB).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := filter(config.DB).
		Select("id, short_id, title, language, views, is_private, expires_at, user_id, created_at").
		Preload("Owner").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&pastes).Error

	return pastes, total, err
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
