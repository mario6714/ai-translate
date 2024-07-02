package xlsx

import (
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"unicode"

	"github.com/xuri/excelize/v2"
)

type IXLSX interface { 
	QueryTranslation(textDTO map[string]interface{}) string
	SaveText(textDTO map[string]interface{})
}

type XLSX struct {}

var APPDATA = os.Getenv("appdata")
var settingsDir = path.Join(APPDATA, "ai-translate")
var file_name string
var workbook *excelize.File

func loadFile(name string) { 
	file_name = name
	file, err := excelize.OpenFile(myFilePath())
	if err == nil { 
		workbook = file
	} else { 
		workbook = excelize.NewFile()
		workbook.SetSheetName("Sheet1", sheetName())
		err := workbook.SaveAs(myFilePath())
		if err != nil { fmt.Println("Error while saving file: ", err) }
	}

}

func myFilePath() string { 
	rawPath := filepath.Join(settingsDir, file_name+".xlsx") 
	cleanPath := filepath.Clean(rawPath)
	return sanitizePath(cleanPath)
}
func sheetName() string { return "Translation" }

func queryEntry(textDTO map[string]interface{}) int { 
	if textDTO == nil { return -1 }
	window_title, ok := textDTO["window_title"].(string)
	originalText, ok2 := textDTO["originalText"].(string)
	if ok && ok2 { 
		loadFile(window_title)
		cols, err := workbook.GetCols(sheetName())
		if err == nil && len(cols) > 0 { 
			for i, cell := range cols[0] { 
				if originalText == cell { return i+1 }
			}
		}
	}

	return -1
}


func (X XLSX) QueryTranslation(textDTO map[string]interface{}) string { 
	defer func() { 
		if workbook != nil {
			if err := workbook.Close(); err != nil {
				log.Printf("error closing workbook: %v", err)
			}
		}
	}()

	var e = queryEntry(textDTO)
	if e != -1 { 
		var entry = strconv.Itoa(e)
		val, err := workbook.GetCellValue(sheetName(), "B"+entry)
		if err != nil { 
			log.Printf(`error in "GetCellValue", failed to get cell value: %v`, err) 
			return ""
		}
		return val
	}

	return ""
}

func (X XLSX) SaveText(textDTO map[string]interface{}) { 
	defer func() { 
		if workbook != nil {
			if err := workbook.Close(); err != nil {
				log.Printf("error closing workbook: %v", err)
			}
		}
	}()

	var e = queryEntry(textDTO)
	var originalText, ok = textDTO["originalText"].(string)
	var translatedText, ok2 = textDTO["translatedText"].(string)
	if e != -1 && ok && ok2 { 
		var entry = strconv.Itoa(e)
		workbook.SetCellValue(sheetName(), "B"+entry, translatedText)

	} else if ok && ok2 { 
		rows, err := workbook.GetRows(sheetName())
		if err == nil { 
			newRowNumber := len(rows) + 1
			newRowStr := strconv.Itoa(newRowNumber)
			err := workbook.SetCellValue(sheetName(), "A"+newRowStr, originalText)
			err2 := workbook.SetCellValue(sheetName(), "B"+newRowStr, translatedText)
			if err != nil { fmt.Println(err) }
			if err2 != nil { fmt.Println(err2) }
			if err3 := workbook.Save(); err3 != nil { fmt.Println(err) }
		}
	}

}

func sanitizePath(path string) string {
	var sanitizedPath strings.Builder
	for _, r := range path {
		if unicode.IsPrint(r) && !unicode.IsControl(r) {
			sanitizedPath.WriteRune(r)
		}
	}
	return sanitizedPath.String()
}