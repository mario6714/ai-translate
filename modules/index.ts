import { GetActiveWindowTitle, GetClipboardText } from "./pywebview/clipboard"
import { GetConfig, SaveConfig, OpenConfigDir, OpenConfigWindow } from "./pywebview/settings"
import { QueryTranslation, SaveText } from "./pywebview/xlsx"



export interface ITextDTO { 
    window_title: string
    originalText: string
    translatedText?: string | null
    history?: string[]
}

export interface IExternalAPI { 
    GetActiveWindowTitle<T= string>(): Promise<T>
    GetClipboardText<T= string>(): Promise<T>
    GetConfig<T= Record<string, unknown>>(): Promise<T>
    SaveConfig(configs: Record<string, unknown> | string): Promise<void>
    OpenConfigDir(): Promise<void>
    OpenConfigWindow(): Promise<void>

    SaveText<T= { error: string } | void>(data: ITextDTO): Promise<T>
    QueryTranslation<T= ITextDTO>(data: ITextDTO): Promise<T>
}

interface IPyWebview { 
    pywebview: { 
        api: IExternalAPI & { 
            readBinary(fileName: string): Promise<string>
            writeBinary(fileName: string, textFile: string): Promise<void>
        }
    }
}

declare global { 
    interface Window extends IPyWebview, IExternalAPI {}
}

export { 
    GetActiveWindowTitle, GetClipboardText,
    GetConfig, SaveConfig, OpenConfigDir, OpenConfigWindow,
    QueryTranslation, SaveText
}