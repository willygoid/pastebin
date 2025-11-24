package utils

import (
	"github.com/sqids/sqids-go"
)

var sqidsEncoder *sqids.Sqids

func init() {
	// Initialize sqids with custom alphabet
	var err error
	sqidsEncoder, err = sqids.New(sqids.Options{
		Alphabet:  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
		MinLength: 8, // Minimum length untuk short ID
	})
	if err != nil {
		panic(err)
	}
}

// GenerateShortID generates a short ID from numeric ID
func GenerateShortID(id uint) string {
	shortID, err := sqidsEncoder.Encode([]uint64{uint64(id)})
	if err != nil {
		return ""
	}
	return shortID
}

// DecodeShortID decodes short ID back to numeric ID
func DecodeShortID(shortID string) (uint, error) {
	numbers := sqidsEncoder.Decode(shortID)
	if len(numbers) == 0 {
		return 0, nil
	}
	return uint(numbers[0]), nil
}
