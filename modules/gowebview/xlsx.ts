import { ITextDTO } from "..";

export async function QueryTranslation(data: ITextDTO) { 
    if ('QueryTranslation' in window) { 
        const response = await window.QueryTranslation<string[]>(data)
        if (response?.length) { return response[0] }
    }
}

export async function SaveText(data: ITextDTO) { 
    if ('SaveText' in window) { 
        return await window.SaveText(data)
    }
}