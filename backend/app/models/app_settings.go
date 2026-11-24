package models

import "time"

// AppSettings stores a single row of application-wide configuration,
// such as OAuth client credentials for social login providers.
type AppSettings struct {
	ID                 uint      `gorm:"primaryKey" json:"-"`
	GoogleClientID     string    `gorm:"type:varchar(255)" json:"google_client_id"`
	GoogleClientSecret string    `gorm:"type:varchar(255)" json:"-"`
	GithubClientID     string    `gorm:"type:varchar(255)" json:"github_client_id"`
	GithubClientSecret string    `gorm:"type:varchar(255)" json:"-"`
	UpdatedAt          time.Time `json:"updated_at"`
}

func (AppSettings) TableName() string {
	return "app_settings"
}
