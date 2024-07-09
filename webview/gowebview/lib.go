package main

import (
	"syscall"
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