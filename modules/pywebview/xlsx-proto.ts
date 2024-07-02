import { Workbook } from 'exceljs';
import { Buffer } from 'buffer';
import { IPyWebview } from '.';



declare global {
    interface Window extends IPyWebview {}
}

export async function openDir() { 
    return await window.pywebview?.api?.open_dir()
}

export class XLSX { 
    private workbook?: Workbook
    constructor( private file_name: string ) {}

    private async loadFile() { 
        const textFile = await window.pywebview?.api?.readBinary(this.fileName)
        const workbook = new Workbook()
        if (textFile) { 
            const buffer = Buffer.from(textFile, 'binary')
            workbook.xlsx.load(buffer)
        }

        workbook.addWorksheet("translation")
        return workbook
    }

    private async saveFile(content: string) { return await window.pywebview?.api?.writeBinary(this.fileName, content) }

    private get worksheet() { return this.workbook?.getWorksheet("translation") }

    get fileName() { return this.file_name+'.xlsx' }

    async queryEntry(originalText: string): Promise<number | null> { 
        if (!this.workbook) { this.workbook = await this.loadFile() }
        let found: number | null = null
        if (this.worksheet) { 
            const column = this.worksheet.getColumn("A")
            column.eachCell({includeEmpty: false}, (cell, rowNumber) => { 
                if (cell.value && cell.value.toString().includes(originalText)) { found = rowNumber }
            } )
        }

        return found
    }

    async queryTranslation(originalText: string) { 
        const entry = await this.queryEntry(originalText)
        return entry? this.worksheet?.getCell("B"+entry)?.toString() : null
    }

    async saveText( {originalText, translatedText}: { originalText: string, translatedText: string } ) { 
        const entry = await this.queryEntry(originalText)
        if(entry && this.worksheet) { this.worksheet.getCell("B"+entry).value = translatedText }
        else if (this.worksheet) { 
            const lastRow = this.worksheet.lastRow?.number ?? 1
            this.worksheet.getCell("A"+lastRow).value = originalText
            this.worksheet.getCell("B"+lastRow).value = translatedText

        } else { return null }

        //this.worksheet?.commit()
        const buffer = await this.workbook?.xlsx.writeBuffer() as Buffer
        if(buffer) { this.saveFile(buffer.toString('binary')) }
    }

}