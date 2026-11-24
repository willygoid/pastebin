package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"pastebin/app/controllers"
	"pastebin/middleware"
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

		// Authentication routes (public)
		authCtrl := controllers.NewAuthController()
		auth := api.Group("/auth")
		{
			auth.POST("/register", authCtrl.Register)
			auth.POST("/login", authCtrl.Login)
		}

		// Paste controller
		pasteCtrl := controllers.NewPasteController()

		// Protected routes (requires authentication)
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// User profile routes
			protected.GET("/profile", authCtrl.GetProfile)
			protected.PUT("/profile", authCtrl.UpdateProfile)
			protected.POST("/change-password", authCtrl.ChangePassword)

			// Current user's own paste collection
			protected.GET("/my-pastes", pasteCtrl.GetMine)
			protected.DELETE("/my-pastes/:id", pasteCtrl.DeleteMine)
		}

		// Admin routes (requires admin role)
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			userCtrl := controllers.NewUserController()

			// User management
			admin.GET("/users", userCtrl.GetAllUsers)
			admin.GET("/users/:id", userCtrl.GetUserByID)
			admin.PUT("/users/:id/role", userCtrl.UpdateUserRole)
			admin.PUT("/users/:id/toggle-status", userCtrl.ToggleUserStatus)
			admin.DELETE("/users/:id", userCtrl.DeleteUser)
			admin.POST("/users/:id/reset-password", userCtrl.ResetPassword)

			// Paste management
			admin.GET("/pastes", pasteCtrl.AdminGetAll)
			admin.DELETE("/pastes/:id", pasteCtrl.AdminDelete)

			// App settings (OAuth credentials etc.)
			settingsCtrl := controllers.NewSettingsController()
			admin.GET("/settings", settingsCtrl.Get)
			admin.PUT("/settings", settingsCtrl.Update)
		}

		// Paste CRUD routes (public for now, can be protected later)
		api.POST("/pastes", middleware.OptionalAuthMiddleware(), pasteCtrl.Create) // Create new paste, owner attached if logged in
		api.GET("/pastes", pasteCtrl.GetRecent)  // Get recent pastes
		api.PUT("/pastes/:id", pasteCtrl.Update) // Update paste by shortID

		// Short URL routes
		api.GET("/:id", pasteCtrl.Get)        // Get paste by shortID
		api.GET("/:id/raw", pasteCtrl.GetRaw) // Get raw paste
		api.DELETE("/:id", pasteCtrl.Delete)  // Delete paste
	}
}
