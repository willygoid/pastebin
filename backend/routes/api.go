package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"pastebin/app/controllers"
)

func SetupRoutes(r *gin.Engine) {
	// Health check - accessible directly at /health
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
		// Health check juga di /api/health
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":  "ok",
				"message": "API is running",
				"service": "pastebin-api",
			})
		})

		// Paste routes
		pasteCtrl := controllers.NewPasteController()

		pastes := api.Group("/pastes")
		{
			pastes.POST("", pasteCtrl.Create)
			pastes.GET("", pasteCtrl.GetRecent)
			pastes.GET("/:id", pasteCtrl.Get)
			pastes.GET("/:id/raw", pasteCtrl.GetRaw)
			pastes.DELETE("/:id", pasteCtrl.Delete)
		}
	}
}
