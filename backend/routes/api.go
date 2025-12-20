package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"pastebin/app/controllers"
)

func SetupRoutes(r *gin.Engine) {
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Server is running",
			"service": "pastebin-api",
		})
	})

	// API routes
	api := r.Group("/api")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":  "ok",
				"message": "API is running",
			})
		})

		// Paste controller
		pasteCtrl := controllers.NewPasteController()

		// Paste CRUD routes
		api.POST("/pastes", pasteCtrl.Create)    // Create new paste
		api.GET("/pastes", pasteCtrl.GetRecent)  // Get recent pastes
		api.PUT("/pastes/:id", pasteCtrl.Update) // Update paste by shortID

		// Short URL routes
		api.GET("/:id", pasteCtrl.Get)        // Get paste by shortID
		api.GET("/:id/raw", pasteCtrl.GetRaw) // Get raw paste
		api.DELETE("/:id", pasteCtrl.Delete)  // Delete paste
	}
}
