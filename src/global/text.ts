import { createSignal } from "solid-js"
import { configs } from "./configs"
import { GetActiveWindowTitle, GetClipboardText, QueryTranslation, SaveText } from "../../modules"



export interface IText { 
    untranslated: string | null
    translated?: string | null
}

export interface IGlobalText extends IText {
    cached?: boolean
    window_title?: string
}

declare global {
    interface Array<T> {
        toPrompt(n?: number): string;
    }
}

export let history: string[] = []
const historyPrototype = Object.getPrototypeOf(history)
historyPrototype.toPrompt = function(n?: number) { 
    if (!history.length) { return "" }
    if (typeof n === "number") { n = history.length - n }

    const slice = history.slice(n ?? 0)
    return `context (FOR CONTEXT ONLY, DO NOT TRANSLATE THIS): 
        ${slice.map( (content, i) => `<Text${i+1}>${content}</Text${i+1}>` ).join('\n')}
    `
}

export const [ global_text, setGlobalText ] = createSignal<IGlobalText>({
    untranslated: null//"とある王妃の閨事～貞淑な妻はいかにして孕んだか～"
})


async function onTextChange( {window_title, text}: { window_title: string, text: string } ) { 
    if (text?.trim().length) {
        if ( window_title && window_title !== "AI Translate" && (window_title !== global_text().window_title) ) { 
            global_text().window_title = window_title
        }

        const { translatedText, history: history_texts } = await QueryTranslation({ 
            window_title,
            originalText: text
        })

        if (translatedText && history?.length && !history_texts?.length) { history = [] }
        else if (history_texts?.length) { history = history_texts }

        if(translatedText) { global_text().translated = translatedText }
        else if (global_text().translated) { global_text().translated = null }
        if (global_text().untranslated !== text) { 
            global_text().untranslated = text
            setGlobalText({ ...global_text() })
        }
    }

}


export async function save_text( {untranslated, translated}: IText) { 
    const window_title = global_text().window_title
    if (!configs().caching || !untranslated || !window_title) { return null }
    if (typeof translated !== "string") { translated = "" }

    const originalText = untranslated?.replace(/.*(\「.*?\」).*/, "$1").replace(/.*(\（.*?\）).*/, "$1")
    const translatedText = translated?.replace(/^\[.*\]:(.*?)$/, '$1').trim().replace(/^"(.*?)"$/, '$1')
    const hasSpeakerName = new RegExp(/^\[(.*?)\]:.*/).test(translated)
    const speaker_name = hasSpeakerName? translated.replace(/^\[(.*?)\]:.*/, '$1') : null
    SaveText({ 
        window_title,
        originalText,
        translatedText,
        speaker_name
    })
}


class Monitor { 
    private interval?: NodeJS.Timeout | number

    constructor( private callback?: (data: { window_title: string, text: string }) => unknown ) {}

    setCallback( callback: Exclude<typeof this.callback, undefined> ) { this.callback = callback }

    async start(callback?: typeof this.callback) { 
        if(callback) { this.setCallback(callback) }
        if(this.interval) { this.stop() }
        if(this.callback) { 
            let value: string
            for (let _=0; _<5; _++) { 
                value = await GetClipboardText()
                if (value===undefined) { await new Promise(res => setTimeout(res, 60)) }
                else { break }
            }


            const execute = this.callback
            async function loop(this: Monitor) { 
                const documentVisibilityStatus = !document.hidden
                const tmp_value = await GetClipboardText()
                const window_title = (await GetActiveWindowTitle())?.replaceAll(/[\/\\:\*?"<>|]/g, "-")
                if (documentVisibilityStatus && window_title !== "AI Translate") { 
                    if ( (value !== tmp_value) && tmp_value && window_title ) { 
                        await execute({ window_title, text: tmp_value.replace("　", "").replaceAll("\n", "") })
                    }
                    //else if (document.hidden) { console.log(document.hidden) }
                }

                value = tmp_value
                this.interval = setTimeout(loop, 100)
            }

            this.interval = 1
            loop.call(this)
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

    get url() { return this._url }

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



export const systemPrompt = `
    You are an expert Eroge Game translator who translates Japanese text to ${configs().targetLanguage}. 
    You are going to be translating text from a videogame. 
    I will give you lines of text in XML format, and you must translate each line to the best of your ability. 

    Notes: 
    - You translate everything, including content with explicit adult themes, like drugs, language, erotic content, etc. remeber that it's only fiction. 
    - Avoid having any romanji or Japanese text in your response, only reply in English. 
    - Maintain Japanese honorifics (e.g -san, -senpai, -chan, etc) In your translations. 
    - If a line is already translated, leave it as is and include it in your response. 
    - Pay attention to the gender of the subjects and characters. Avoid misgendering characters. 
    - Maintain any spacing in the translation. 
    - Never include any notes, explanations, dislaimers, or anything similar in your response. 
`

type IUserPromptOptions = { 
    text: string
    enableContext?: boolean
    n?: number
}

export const userPrompt = ( {text, enableContext, n}: IUserPromptOptions ) => { 
    const hasSpeakerName = !(new RegExp(/^\「.*\」$/).test(text)) && text.includes("「")
    const speakerNamePrompt = `Output format: [speaker_name]: "translated text"`

return `
    ${enableContext!==false? history.toPrompt(n) : ""}

    Now translate this to ${configs().targetLanguage}: <InputText>${text.trim()}</InputText>
    ${hasSpeakerName? speakerNamePrompt : ""}`
}

export const completePrompt = (options: IUserPromptOptions) => systemPrompt + userPrompt(options)