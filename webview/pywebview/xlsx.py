from typing import Dict, Tuple
import openpyxl, os
from openpyxl import Workbook
from openpyxl.worksheet.worksheet import Worksheet
from openpyxl.cell.cell import Cell



APPDATA = os.getenv('appdata')
file_name: str | None = None
workbook: Workbook | None = None

class TextDTO:
    def __init__(self, DTO: Dict[str, str]):
        self.window_title = DTO["window_title"]
        self.originalText = DTO["originalText"]
        self.translatedText = DTO["translatedText"] if "translatedText" in DTO else None


def loadFile(name: str): 
    global workbook, file_name
    file_name = name
    try: workbook = openpyxl.load_workbook(filePath())
    except: 
        workbook = Workbook()
        workbook.active.title = 'Translation'

def worksheet() -> Worksheet: 
    if workbook is not None: return workbook['Translation']

def filePath() -> str: return os.path.join(APPDATA, 'ai-translate', file_name+'.xlsx')

def queryEntry(textDTO: Dict[str, str]):
    if isinstance(textDTO, dict) and textDTO['window_title'] is not None: 
        textDTO: TextDTO = TextDTO(textDTO)
        if textDTO.window_title != file_name: loadFile(textDTO.window_title)
        if worksheet() is not None:
            column: Tuple[Cell] = worksheet()['A']
            for cell in column:
                if cell.value is not None and textDTO.originalText in cell.value: return cell.row



class XLSX:
    def QueryTranslation(self, textDTO: Dict[str, str]) -> str | None: 
        entry = queryEntry(textDTO)
        if entry is not None: 
            cell = worksheet().cell(row= entry, column=2)
            return cell.value


    def SaveText(self, textDTO: Dict[str, str]):
        entry = queryEntry(textDTO)
        textDTO: TextDTO = TextDTO(textDTO)
        if entry is not None and worksheet() is not None: 
            cell = worksheet().cell(row= entry, column=2)
            cell.value = textDTO.translatedText

        elif worksheet() is not None: 
            lastRow = worksheet().max_row+1 # same variable for both calls to avoid the "stairs" bug
            cellA = worksheet().cell(row= lastRow, column=1)
            cellB = worksheet().cell(row= lastRow, column=2)
            cellA.value = textDTO.originalText
            cellB.value = textDTO.translatedText
        
        else: return

        workbook.save(filePath())


