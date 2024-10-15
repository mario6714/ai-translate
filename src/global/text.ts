import { createSignal } from "solid-js"
import { configs } from "./configs"
import { QueryTranslation, SaveText } from "../../modules"
import { Monitor, WsClient } from "./lib"



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


export class MyClipboardMonitor extends Monitor { 
    constructor() { super(onTextChange) }
}

export class MyWs extends WsClient { 
    constructor(url?: string) { 
        super(url) 
        this.setCallback(onTextChange)
    }
}



export const systemPrompt = `
    You are an expert Eroge Game translator who translates Japanese text to ${configs().targetLanguage}. 
    You are going to be translating text from a videogame. 
    I will give you lines of text in XML format, and you must translate each line to the best of your ability. 
    Respond with the translated text only. 

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
    const hasSpeakerName = (!(new RegExp(/^\「.*\」$/).test(text)) && text.includes("「")) ||
        (!(new RegExp(/^\（.*\）$/).test(text)) && text.includes("（"))
    const speakerNamePrompt = `Output format: [speaker_name]: "translated text"`

return `
    ${enableContext!==false? history.toPrompt(n) : ""}

    Now translate this to ${configs().targetLanguage}: <InputText>${text.trim()}</InputText>
    ${hasSpeakerName? speakerNamePrompt : ""}`
}

export const completePrompt = (options: IUserPromptOptions) => systemPrompt + userPrompt(options)