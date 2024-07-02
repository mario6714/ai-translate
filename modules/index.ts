import { GetActiveWindowTitle, GetClipboardText } from "./pywebview/clipboard"
import { GetConfig, SaveConfig, OpenConfigDir, OpenConfigWindow } from "./pywebview/settings"
import { QueryTranslation, SaveText } from "./pywebview/xlsx"
import { IPyWebview } from "./pywebview"



export interface ITextDTO { 
    window_title: string
    originalText: string
    translatedText?: string | null
}

export interface IExternalAPI { 
    GetActiveWindowTitle<T= string>(): Promise<T>
    GetClipboardText<T= string>(): Promise<T>
    GetConfig<T= Record<string, unknown>>(): Promise<T>
    SaveConfig(configs: Record<string, unknown> | string): Promise<void>
    OpenConfigDir(): Promise<void>
    SaveText(data: ITextDTO): Promise<void>
    QueryTranslation<T= string>(data: ITextDTO): Promise<T>
}

declare global { 
    interface Window extends IPyWebview, IExternalAPI {}
}

export { 
    GetActiveWindowTitle, GetClipboardText,
    GetConfig, SaveConfig, OpenConfigDir, OpenConfigWindow,
    QueryTranslation, SaveText
}