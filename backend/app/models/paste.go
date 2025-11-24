package models

import (
	"time"

	"gorm.io/gorm"
)

type Paste struct {
	ID        uint           `gorm:"primaryKey;autoIncrement" json:"-"`
	ShortID   string         `gorm:"type:varchar(20);uniqueIndex:idx_short_id;not null;default:''" json:"id"`
	Title     string         `gorm:"type:varchar(255);index:idx_title,type:gin" json:"title"` // GIN index for text search
	Content   string         `gorm:"type:text;not null" json:"content"`
	Language  string         `gorm:"type:varchar(50);index:idx_language;default:'text'" json:"language"`
	ExpiresAt *time.Time     `gorm:"index:idx_expires_at" json:"expires_at"`
	Views     int            `gorm:"default:0;index:idx_views" json:"views"`
	IsPrivate bool           `gorm:"default:false;index:idx_is_private" json:"is_private"`
	Password  string         `gorm:"type:varchar(255)" json:"-"`
	CreatedAt time.Time      `gorm:"index:idx_created_at" json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index:idx_deleted_at" json:"-"`
}

// TableName override
func (Paste) TableName() string {
	return "pastes"
}

// AfterCreate hook to trigger after creation
func (p *Paste) AfterCreate(tx *gorm.DB) error {
	// Automatically set updated_at
	return nil
}

// BeforeUpdate hook
func (p *Paste) BeforeUpdate(tx *gorm.DB) error {
	p.UpdatedAt = time.Now()
	return nil
}
