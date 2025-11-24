package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Paste struct {
	ID        string         `gorm:"type:uuid;primary_key" json:"id"`
	Title     string         `gorm:"size:255" json:"title"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	Language  string         `gorm:"size:50;default:'text'" json:"language"`
	ExpiresAt *time.Time     `json:"expires_at"`
	Views     int            `gorm:"default:0" json:"views"`
	IsPrivate bool           `gorm:"default:false" json:"is_private"`
	Password  string         `gorm:"size:255" json:"-"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate hook to generate UUID
func (p *Paste) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

// TableName override
func (Paste) TableName() string {
	return "pastes"
}
