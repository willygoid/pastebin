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

		// Paste routes
		pasteCtrl := controllers.NewPasteController()

		// Create paste
		api.POST("/pastes", pasteCtrl.Create)

		// Get recent pastes
		api.GET("/pastes", pasteCtrl.GetRecent)

		// Short URL routes
		api.GET("/:id", pasteCtrl.Get)
		api.GET("/:id/raw", pasteCtrl.GetRaw)
		api.DELETE("/:id", pasteCtrl.Delete)
	}

	// Root level short URL routes (untuk akses langsung tanpa /api)
	pasteCtrl := controllers.NewPasteController()
	r.GET("/:id", pasteCtrl.Get)
	r.GET("/:id/raw", pasteCtrl.GetRaw)
}
