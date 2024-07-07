import { JSX, createSignal } from "solid-js"
import { configs, save_config } from "./configs"
import { IModel, TProviderKeys } from "../providers"
import { GetActiveWindowTitle, GetClipboardText, QueryTranslation, SaveText } from "../../modules/"



export type IExtendedModel = IModel & { 
    provider_key: string
    component?: JSX.Element
}

export interface IText { 
    untranslated: string
    translated?: string | null
}

export interface IGlobalText extends IText {
    cached?: boolean
    window_title?: string
}

export const [ global_text, setGlobalText ] = createSignal<IGlobalText>({
    untranslated: "とある王妃の閨事～貞淑な妻はいかにして孕んだか～"
})

export const [ enabledModels, setEnabledM ] = createSignal<IExtendedModel[] | null>(null)

export function getEnabled() { 
    const enabled_models: IExtendedModel[] = []
    Object.keys(configs().providers).forEach(provider_key => { 
        const enabled = configs().providers[provider_key as TProviderKeys]?.models?.filter( (m: IModel) => m.enabled)
        .map(m => Object.assign( {...m}, {provider_key}) )
        if (enabled?.length) { enabled_models.push(...enabled) }
    } )

    enabled_models.sort( (b, a) => { 
        if (a.index && b.index) { return b.index < a.index? -1 : 0 }
        return 0
    } )

    let flag = false
    for (let i=0; i<enabled_models.length-1; i++) { 
        const a = enabled_models[i]; const b = enabled_models[i+1]
        if (a.index && b.index) { 
            if (b.index > a.index + 1 || b.index === a.index) { 
                b.index = a.index+1 
                const modelB = configs().getM(b.provider_key, b.name) as IModel 
                modelB.index = a.index+1
                if (!flag) { flag = true }
            }
        }
    }

    if (flag) { save_config(configs()) }
    setEnabledM(enabled_models)
    return enabled_models
}



async function onTextChange( {window_title, text}: { window_title: string, text: string } ) { 
    if (text?.trim().length) {
        if ( window_title && (window_title !== global_text().window_title) ) { global_text().window_title = window_title }
        const translation = await QueryTranslation({ 
            window_title,
            originalText: text
        } )
        if(translation) { global_text().translated = translation }
        else if (global_text().translated) { global_text().translated = null }
        global_text().untranslated = text
        setGlobalText({ ...global_text() })
    }
}


export async function save_text( {untranslated, translated}: IText)  { 
    if (!configs().caching || !untranslated) { return null }
    const window_title = global_text().window_title
    if(window_title) { 
        SaveText({ 
            window_title,
            originalText: untranslated,
            translatedText: translated,
        })
    }
}


class Monitor { 
    private interval?: NodeJS.Timeout

    constructor( private callback?: (data: { window_title: string, text: string }) => unknown ) {}

    setCallback( callback: Exclude<typeof this.callback, undefined> ) { this.callback = callback }

    async start(callback?: typeof this.callback) { 
        if(callback) { this.setCallback(callback) }
        if(this.interval) { this.stop() }
        if(this.callback) { 
            let value: string
            for (let _=0; _<3; _++) { 
                value = await GetClipboardText()
                if (value===undefined) { await new Promise(res => setTimeout(res, 60)) }
                else { break }
            }


            const execute = this.callback
            this.interval = setInterval(async function() { 
                const tmp_value = await GetClipboardText()
                const window_title = await GetActiveWindowTitle()
                if (!document.hidden) { 
                    if ( (value !== tmp_value) && tmp_value && window_title && document.hidden===false ) { 
                        execute({ window_title, text: tmp_value })
                    }
                    else if (document.hidden) { console.log(document.hidden) }
                }

                value = tmp_value

            }, 300)
        }
    }

    stop() { 
        clearInterval(this.interval)
        this.interval = undefined
    }

    isRunning() { return this.interval? true : false }

}


export class MyClipboardMonitor extends Monitor { 
    constructor() { super(onTextChange) }
}


export class MyWs { 
    private socket?: WebSocket
    constructor( private _url?: string ) { 
        if(_url) { this.socket = new WebSocket(_url) }
    }

    private loadListeners() { 
        if (this.socket) { 
            this.socket.addEventListener('message', async(event) => { 
                const window_title = await GetActiveWindowTitle()
                const text = event.data
                if (window_title) { onTextChange({ window_title, text }) }
            } )
        }
    }

    connect() { 
        if( this._url && (!this.socket || this.socket.CLOSED) ) { 
            this.socket = new WebSocket(this._url) 
            this.loadListeners()
        }
    }

    setUrl(url: string) { 
        this._url = url
        this.connect()
    }

    close() { 
        if(this.socket) { this.socket.close() }
    }

    isOpen() { return this.socket?.OPEN===1? true : false }

}