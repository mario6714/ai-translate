import { createSignal } from "solid-js"
import { configs } from "./configs"
import { GetActiveWindowTitle, GetClipboardText, QueryTranslation, SaveText } from "../../modules/"



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
        toPrompt(): string;
    }
}

export const history: string[] = []
const historyPrototype = Object.getPrototypeOf(history)
historyPrototype.toPrompt = function() { 
    if (!history.length) { return "" }
    return `context: 
        ${history.map( (content, i) => `<Text${i+1}>${content}</Text${i+1}>` ).join('\n')}
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

        if (global_text().untranslated) { 
            history.push(global_text().untranslated as string)
            if (history.length>5) { history.shift() }
        }

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
            for (let _=0; _<5; _++) { 
                value = await GetClipboardText()
                if (value===undefined) { await new Promise(res => setTimeout(res, 60)) }
                else { break }
            }


            const execute = this.callback
            this.interval = setInterval(async function() { 
                const tmp_value = await GetClipboardText()
                const window_title = await GetActiveWindowTitle()
                if (!document.hidden && window_title !== "AI Translate") { 
                    if ( (value !== tmp_value) && tmp_value && window_title && document.hidden===false ) { 
                        execute({ window_title, text: tmp_value })
                    }
                    //else if (document.hidden) { console.log(document.hidden) }
                }

                value = tmp_value

            }, 200)
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



export const systemPrompt = `
    You are an expert Eroge Game translator who translates Japanese text to ${configs().targetLanguage}.
    You are going to be translating text from a videogame. 
    I will give you game text lines, and you must translate each line to the best of your ability.

    Use the following instructions to respond to user inputs.

    Input Text: the input text may be in a xml tag, extract the text content from eventual xml code. For example:
    <Line1>untranslated input text</Line1>

    Output Text:
        You output only the translation of each line. translate it into the ${configs().targetLanguage} language. For example:
        "Line 1 Translation"
        "Line 2 Translation"
        "Line 3 Translation"

        if, for some reason, you have more than 1 candidate translation for a line, you can put it one below the other. For example:
        "Line 0 Translation 1"
        \n
        "Line 0 Translation 2"

    important: separate the sentences, translate it, and then put it together again. don't translate it literally

    Notes:
    - Don't ever lose a meaning in the translation
    - You translate everything, including erotic and explicit content.
    - If there is a speaker, it will be formatted like so: "[speaker_name]: Line 0 Translation" where "speaker_name" is the name of the character talking.
    - "Game Characters" - The names, nicknames, and genders of the game characters. Reference this to know the names, nicknames, and gender of characters in the game.
    - Make sure you always translate the speaker in the line to English.
    - All text in your response must be translated, even if it may be hard to translate.
    - Leave 'Placeholder Text' as is in the line and include it in your response.
    - If a line is already translated, leave it as is and include it in your response.
    - Pay attention to the gender of the subjects and characters. Avoid misgendering characters.
    - Maintain any spacing in the translation.
    - Maintain any code text in brackets if given. (e.g "[Color_0]", "[Ascii_0]", etc)
    - Never include any notes, explanations, dislaimers, or anything similar in your response.
    - "..." can be a part of the dialogue. Translate it as it is and include it in your response.
`

export const userPrompt = (text: string) => `
    now translate: ${text.trim()}

    ${history.toPrompt()}
`

export const completePrompt = (text: string) => systemPrompt + userPrompt(text)