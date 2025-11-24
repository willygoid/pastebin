package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client
var Ctx = context.Background()

func ConnectRedis() {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", os.Getenv("REDIS_HOST"), os.Getenv("REDIS_PORT")),
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       0,

		// Connection pool settings
		PoolSize:        50,               // Maximum number of socket connections
		MinIdleConns:    10,               // Minimum number of idle connections
		MaxIdleConns:    20,               // Maximum number of idle connections
		ConnMaxIdleTime: 10 * time.Minute, // Maximum amount of time a connection may be idle
		ConnMaxLifetime: time.Hour,        // Maximum amount of time a connection may be reused

		// Timeouts
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolTimeout:  4 * time.Second,

		// Retry settings
		MaxRetries:      3,
		MinRetryBackoff: 8 * time.Millisecond,
		MaxRetryBackoff: 512 * time.Millisecond,
	})

	_, err := RedisClient.Ping(Ctx).Result()
	if err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}

	fmt.Println("Redis connected successfully with optimized settings!")
}

// GetWithCache - helper function for cache pattern
func GetWithCache(key string, ttl time.Duration, fetchFunc func() (interface{}, error)) (interface{}, error) {
	// Try to get from cache
	val, err := RedisClient.Get(Ctx, key).Result()
	if err == nil {
		return val, nil
	}

	// Cache miss, fetch from source
	data, err := fetchFunc()
	if err != nil {
		return nil, err
	}

	// Store in cache
	RedisClient.Set(Ctx, key, data, ttl)

	return data, nil
}
