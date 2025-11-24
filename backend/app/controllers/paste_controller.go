package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"pastebin/app/models"
	"pastebin/app/services"
	"pastebin/utils"
)

type PasteController struct {
	service *services.PasteService
}

func NewPasteController() *PasteController {
	return &PasteController{
		service: services.NewPasteService(),
	}
}

type CreatePasteRequest struct {
	Title     string `json:"title"`
	Content   string `json:"content" binding:"required"`
	Language  string `json:"language"`
	ExpiresIn int    `json:"expires_in"` // in hours, 0 = never
	IsPrivate bool   `json:"is_private"`
	Password  string `json:"password"`
}

func (ctrl *PasteController) Create(c *gin.Context) {
	var req CreatePasteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	paste := &models.Paste{
		Title:     req.Title,
		Content:   req.Content,
		Language:  req.Language,
		IsPrivate: req.IsPrivate,
		Password:  req.Password,
	}

	// Set expiration
	if req.ExpiresIn > 0 {
		expiresAt := time.Now().Add(time.Duration(req.ExpiresIn) * time.Hour)
		paste.ExpiresAt = &expiresAt
	}

	if err := ctrl.service.CreatePaste(paste); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create paste")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Paste created successfully", paste)
}

func (ctrl *PasteController) Get(c *gin.Context) {
	shortID := c.Param("id")

	paste, err := ctrl.service.GetPaste(shortID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Paste not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Paste retrieved successfully", paste)
}

func (ctrl *PasteController) GetRecent(c *gin.Context) {
	limit := 20
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	pastes, err := ctrl.service.GetRecentPastes(limit)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch pastes")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Recent pastes", pastes)
}

func (ctrl *PasteController) Delete(c *gin.Context) {
	shortID := c.Param("id")

	if err := ctrl.service.DeletePaste(shortID); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete paste")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Paste deleted successfully", nil)
}

func (ctrl *PasteController) GetRaw(c *gin.Context) {
	shortID := c.Param("id")

	paste, err := ctrl.service.GetPaste(shortID)
	if err != nil {
		c.String(http.StatusNotFound, "Paste not found")
		return
	}

	// Set content type to plain text
	c.Header("Content-Type", "text/plain; charset=utf-8")

	// Disable caching for accurate view count
	c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")

	// Return pure text content
	c.String(http.StatusOK, paste.Content)
}
