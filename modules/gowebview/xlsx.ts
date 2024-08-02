import { ITextDTO } from "..";

export async function QueryTranslation(data: ITextDTO): Promise<ITextDTO> { 
    if ('QueryTranslation' in window) { 
        const response = await window.QueryTranslation<ITextDTO[]>(data)
        if (response?.length) { return response[0] }
    }

    return {} as ITextDTO
}

export async function SaveText(data: ITextDTO) { 
    if ('SaveText' in window) { 
        const response = await window.SaveText< ({ error: string } | void)[] >(data)
        if (response?.[0]?.error) { alert(response[0].error) }
        return response
    }
}

