package main

import (
	"fmt"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/zserge/lorca"
)

func main() {
	// 1. CARI BROWSER OTOMATIS (Cross-Platform)
	customChromePath := findBrowserPath()
	if customChromePath == "" {
		fmt.Println("CRITICAL: Tidak ditemukan Chrome/Edge/Chromium di sistem ini.")
		fmt.Println("Silakan instal Google Chrome terlebih dahulu.")
		return
	}
	fmt.Println("Menggunakan Browser:", customChromePath)

	// Set Environment variable agar Lorca menggunakan path yang kita temukan
	os.Setenv("LORCA_CHROME", customChromePath)

	// 2. ARGUMEN KIOSK
	args := []string{
		"--kiosk",            // Fullscreen mutlak
		"--incognito",        // Mode penyamaran (no cache)
		"--no-first-run",     // Skip welcome screen
		"--disable-infobars", // Hapus notifikasi "controlled by automation"
		"--disable-session-crashed-bubble",
		"--force-device-scale-factor=1", // Mencegah zoom aneh (DPI Scaling fix)
	}

	// 3. JALANKAN LORCA
	// Profile dir dikosongkan ("") agar menggunakan temp folder
	ui, err := lorca.New("https://www.google.com", "", 0, 0, args...)
	if err != nil {
		fmt.Println("Gagal membuka browser:", err)
		return
	}
	defer ui.Close()

	// 4. BINDING FUNGSI GO
	// Fungsi untuk menutup aplikasi dari Javascript
	ui.Bind("exitApp", func() {
		fmt.Println("Exit requested via Long Press.")
		ui.Close() // Menutup jendela Lorca -> Program selesai
	})

	// 5. INJECT LOGIC JAVASCRIPT
	// Menggunakan Goroutine agar script terus ditempel ulang jika halaman refresh
	go func() {
		jsScript := `
			var clickCount = 0;
			var clickTimer = null;
			var pressTimer = null;
			var isLongPress = false;

			// --- A. 5 KLIK -> REFRESH ---
			document.addEventListener('click', function(e) {
				if (isLongPress) { isLongPress = false; return; }

				clickCount++;
				if (clickTimer) clearTimeout(clickTimer);
				clickTimer = setTimeout(function() { clickCount = 0; }, 400);

				if (clickCount >= 5) {
					console.log("5 Clicks detected: Refreshing...");
					location.reload(); 
					clickCount = 0;
				}
			});

			// --- B. LONG PRESS 3 DETIK -> EXIT APP ---
			function startPress() {
				isLongPress = false;
				pressTimer = setTimeout(function() {
					isLongPress = true;
					console.log("Long Press detected: Exiting...");
					// Panggil fungsi Go
					window.exitApp();
				}, 3000); // 3 Detik
			}

			function cancelPress() {
				if (pressTimer) clearTimeout(pressTimer);
			}

			// Support Mouse & Touchscreen
			document.addEventListener('mousedown', startPress);
			document.addEventListener('mouseup', cancelPress);
			document.addEventListener('touchstart', startPress);
			document.addEventListener('touchend', cancelPress);
		`

		for {
			// Cek apakah UI masih aktif
			select {
			case <-ui.Done():
				return
			default:
				// Inject script setiap 1 detik (Polling)
				// Ini memastikan logic tetap jalan walau user pindah ke hasil pencarian Google
				ui.Eval(jsScript)
				time.Sleep(1 * time.Second)
			}
		}
	}()

	// Tunggu sinyal close dari OS (Ctrl+C) atau dari UI
	sigc := make(chan os.Signal, 1)
	signal.Notify(sigc, os.Interrupt, syscall.SIGTERM)
	select {
	case <-sigc:
	case <-ui.Done():
	}
}

// --- FUNGSI PENCARI BROWSER (MAC/LINUX/WINDOWS) ---
func findBrowserPath() string {
	var paths []string

	switch runtime.GOOS {
	case "darwin": // macOS
		paths = []string{
			"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
			"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
			"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
			"/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
			"/usr/bin/google-chrome",
		}
	case "windows": // Windows
		paths = []string{
			"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
			"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
			"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
			"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
			os.Getenv("LOCALAPPDATA") + "\\Google\\Chrome\\Application\\chrome.exe",
		}
	case "linux": // Linux
		paths = []string{
			"/usr/bin/google-chrome",
			"/usr/bin/google-chrome-stable",
			"/usr/bin/chromium",
			"/usr/bin/chromium-browser",
			"/snap/bin/chromium",
		}
	}

	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return ""
}
