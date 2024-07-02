package main

import (
	"fmt"
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows"
)

var user32 = syscall.NewLazyDLL("user32.dll")
var User32SetWindowPos = user32.NewProc("SetWindowPos")

const ( 
	SWP_NORESIZE   = 0x0001
	SWP_NOMOVE     = 0x0002
	HWND_TOPMOST   = ^uintptr(0) // -1
	HWND_NOTOPMOST = ^uintptr(1) // -2
	NEW_X = 0
	NEW_Y = 0
	NEW_W = 0
	NEW_H = 0
)

func SetAlwaysOnTop(w uintptr, b bool) {
	if b {
		User32SetWindowPos.Call(w, HWND_TOPMOST, NEW_X, NEW_Y, NEW_W, NEW_H, SWP_NORESIZE|SWP_NOMOVE)
	} else {
		User32SetWindowPos.Call(w, HWND_NOTOPMOST, NEW_X, NEW_Y, NEW_W, NEW_H, SWP_NORESIZE|SWP_NOMOVE)
	}
}



var procLoadImage = user32.NewProc("LoadImageW")

const (
	IMAGE_ICON      = 1
	LR_LOADFROMFILE = 0x00000010
)

func LoadIcon(iconPath string) (uint, error) {
	fmt.Println(iconPath)
	var utf16Path, err = windows.UTF16PtrFromString(iconPath)
	if err != nil { return 0, err }

	hIcon, _, err := procLoadImage.Call(
		0,
		uintptr(unsafe.Pointer(utf16Path)),
		IMAGE_ICON,
		0,
		0,
		LR_LOADFROMFILE,
	)

	fmt.Println(hIcon)
	return uint(hIcon), err
}

func ChangeIcon() { 
	var hinstance windows.Handle
	_ = windows.GetModuleHandleEx(0, nil, &hinstance)
}