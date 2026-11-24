package controllers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"pastebin/app/models"
	"pastebin/app/repositories"
	"pastebin/app/services"
	"pastebin/config"
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
		Title:     req.Title, // Can be empty, will be set to shortID in service
		Content:   req.Content,
		Language:  req.Language,
		IsPrivate: req.IsPrivate,
		Password:  req.Password,
	}

	// Attach owner if the request was made by a logged-in user (OptionalAuthMiddleware)
	if userID, exists := c.Get("user_id"); exists {
		id := userID.(uint)
		paste.UserID = &id
	}

	// Set expiration
	if req.ExpiresIn > 0 {
		expiresAt := time.Now().Add(time.Duration(req.ExpiresIn) * time.Hour)
		paste.ExpiresAt = &expiresAt
	}

	// Create paste (service will handle empty title)
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

func (ctrl *PasteController) Update(c *gin.Context) {
	shortID := c.Param("id")

	log.Printf("Update request received for shortID: %s", shortID)

	var req CreatePasteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Invalid request body: %v", err)
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	log.Printf("Request data - Title: %s, Language: %s, Content length: %d",
		req.Title, req.Language, len(req.Content))

	// Get existing paste
	paste, err := ctrl.service.GetPaste(shortID)
	if err != nil {
		log.Printf("Paste not found: %s, Error: %v", shortID, err)
		utils.ErrorResponse(c, http.StatusNotFound, "Paste not found")
		return
	}

	log.Printf("Found existing paste: %s", paste.ShortID)

	// Update fields
	paste.Content = req.Content
	paste.Language = req.Language

	// Update title
	if req.Title != "" {
		paste.Title = req.Title
	} else {
		paste.Title = paste.ShortID
	}

	// Update expiration if provided
	if req.ExpiresIn > 0 {
		expiresAt := time.Now().Add(time.Duration(req.ExpiresIn) * time.Hour)
		paste.ExpiresAt = &expiresAt
	}

	// Get repository instance
	repo := repositories.NewPasteRepository()

	// Save updates
	if err := repo.Update(paste); err != nil {
		log.Printf("Failed to update paste: %v", err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update paste")
		return
	}

	log.Printf("Paste updated successfully: %s", paste.ShortID)

	// Clear cache
	cacheKey := fmt.Sprintf("paste:%s", shortID)
	config.RedisClient.Del(config.Ctx, cacheKey)

	utils.SuccessResponse(c, http.StatusOK, "Paste updated successfully", paste)
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

// GetMine returns the pastes owned by the current logged-in user
func (ctrl *PasteController) GetMine(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	offset := (page - 1) * limit

	pastes, total, err := ctrl.service.GetMyPastes(userID, limit, offset, search)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch pastes")
		return
	}

	totalPages := (total + int64(limit) - 1) / int64(limit)

	utils.SuccessResponse(c, http.StatusOK, "Pastes retrieved successfully", gin.H{
		"pastes": pastes,
		"pagination": gin.H{
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": totalPages,
		},
	})
}

// DeleteMine deletes a paste owned by the current logged-in user
func (ctrl *PasteController) DeleteMine(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	shortID := c.Param("id")

	if err := ctrl.service.DeleteOwnedPaste(shortID, userID); err != nil {
		utils.ErrorResponse(c, http.StatusForbidden, "Paste not found or not owned by you")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Paste deleted successfully", nil)
}

// AdminGetAll returns all pastes with pagination and search (admin only)
func (ctrl *PasteController) AdminGetAll(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	offset := (page - 1) * limit

	pastes, total, err := ctrl.service.GetAllPastesAdmin(limit, offset, search)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch pastes")
		return
	}

	totalPages := (total + int64(limit) - 1) / int64(limit)

	utils.SuccessResponse(c, http.StatusOK, "Pastes retrieved successfully", gin.H{
		"pastes": pastes,
		"pagination": gin.H{
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": totalPages,
		},
	})
}

// AdminDelete deletes a paste by short ID (admin only)
func (ctrl *PasteController) AdminDelete(c *gin.Context) {
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
