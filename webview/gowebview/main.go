package main

import (
	"gowebview/server"

	"github.com/jchv/go-webview2"
)

func main() { 
	window := webview2.NewWithOptions(webview2.WebViewOptions{ 
		Debug: true,
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{ 
			Title: "AI Translate",
			IconId: 1,
		},
	})

	defer window.Terminate()
	app := App{}
	app.New(window)
	window.Navigate("http://localhost:5173/")
	go server.Listen(5173)
	window.Run()
}

