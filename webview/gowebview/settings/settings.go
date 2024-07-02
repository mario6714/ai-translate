package settings

import (
	"log"
	"os"
	"os/exec"
	"path"
)

type ISettings interface { 
	OpenConfigDir()
	GetConfig() string
	SaveConfig(content string)
}

type Settings struct {}

var APPDATA = os.Getenv("appdata")
var appDir = path.Join(APPDATA, "ai-translate")
var configFilePath = path.Join(appDir, "config.json")

func (S Settings) OpenConfigDir() { 
	exec.Command("explorer "+appDir)
}

func (S Settings) GetConfig() string { 
	file, err := os.ReadFile(configFilePath)

	if err != nil { log.Fatal(err) }
	return string(file)
}

func (S Settings) SaveConfig(content string) { 
	file, err := os.OpenFile(configFilePath, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0644)
	if err == nil { file.WriteString(content) }
}

