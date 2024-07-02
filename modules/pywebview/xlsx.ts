import { ITextDTO } from ".."

export async function QueryTranslation(data: ITextDTO) { 
    return await window.pywebview?.api?.QueryTranslation(data)
}

export async function SaveText(data: ITextDTO ) { 
    return await window.pywebview?.api?.SaveText(data)
}