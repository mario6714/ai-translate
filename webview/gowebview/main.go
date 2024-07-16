package main

import (
	"gowebview/server"
)

func main() { 
	go server.Listen(5173)
	app := App{ 
		AlwaysOnTop: true,
	}
	app.New()
	defer app.Window.Terminate()

	app.Window.Navigate("http://localhost:5173/")
	app.Window.Run()
}

