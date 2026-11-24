package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"pastebin/app/services"
)

type SettingsController struct {
	service *services.SettingsService
}

func NewSettingsController() *SettingsController {
	return &SettingsController{
		service: services.NewSettingsService(),
	}
}

// Get returns the current OAuth settings. Secrets are never returned in plaintext;
// only whether they are currently set is exposed.
func (ctrl *SettingsController) Get(c *gin.Context) {
	settings, err := ctrl.service.Get()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"settings": gin.H{
			"google_client_id":         settings.GoogleClientID,
			"google_client_secret_set": settings.GoogleClientSecret != "",
			"github_client_id":         settings.GithubClientID,
			"github_client_secret_set": settings.GithubClientSecret != "",
			"updated_at":               settings.UpdatedAt,
		},
	})
}

// Update updates one or more OAuth settings fields. Omitted or empty secret fields
// are left unchanged, so the admin never has to resubmit an existing secret.
func (ctrl *SettingsController) Update(c *gin.Context) {
	var req struct {
		GoogleClientID     *string `json:"google_client_id"`
		GoogleClientSecret *string `json:"google_client_secret"`
		GithubClientID     *string `json:"github_client_id"`
		GithubClientSecret *string `json:"github_client_secret"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	settings, err := ctrl.service.Update(services.UpdateSettingsInput{
		GoogleClientID:     req.GoogleClientID,
		GoogleClientSecret: req.GoogleClientSecret,
		GithubClientID:     req.GithubClientID,
		GithubClientSecret: req.GithubClientSecret,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Settings updated successfully",
		"settings": gin.H{
			"google_client_id":         settings.GoogleClientID,
			"google_client_secret_set": settings.GoogleClientSecret != "",
			"github_client_id":         settings.GithubClientID,
			"github_client_secret_set": settings.GithubClientSecret != "",
			"updated_at":               settings.UpdatedAt,
		},
	})
}
