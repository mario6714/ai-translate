package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/jchv/go-webview2"
)

func main() { 
	currentDir, _ := os.Getwd()
	hIcon, _ := LoadIcon(filepath.Join(currentDir, "assets", "favicon.ico"))
	fmt.Println(hIcon)
	window := webview2.NewWithOptions(webview2.WebViewOptions{ 
		Debug: true,
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{ 
			Title: "AI Translate",
			IconId: hIcon,
		},
	})

	defer window.Terminate()
	app := App{}
	app.New(window)
	window.Navigate("http://localhost:5173/")
	window.Run()
}

