package main

import (
	"gowebview/clipboard"
	"gowebview/settings"
	"gowebview/xlsx"
	"log"
	"reflect"
	"unsafe"

	"github.com/jchv/go-webview2"
)

type Window = webview2.WebView
//Bind(Window, string, interface{})

type IAPI interface { 
	settings.ISettings
	clipboard.IClipboard
	xlsx.IXLSX
}

type API struct {
	settings.Settings
	clipboard.Clipboard
	xlsx.XLSX
}

type App struct {}

func (app *App) New(w Window) { 
	bind(w)
	SetAlwaysOnTop(uintptr(unsafe.Pointer(w.Window())), true)
}

func bind(w Window) { 
	if w == nil { log.Fatal("error in binding") }
	var api IAPI = API{}
	ref := reflect.TypeOf(api)

	for i := 0; i < ref.NumMethod(); i++ { 
		methodName := ref.Method(i).Name // type: reflect.Method
		method := reflect.ValueOf(api).MethodByName(methodName)
		w.Bind(methodName, wrapper(method))
	}

}

func wrapper(method reflect.Value) func(args ...interface{}) []interface{} {
	return func(args ...interface{}) []interface{} {
		in := make([]reflect.Value, len(args))
		for i, arg := range args {
			in[i] = reflect.ValueOf(arg)
		}

		response := method.Call(in)
		out := make([]interface{}, len(response))
		for i, value := range response {
			out[i] = value.Interface()
		}
		return out
	}
}



