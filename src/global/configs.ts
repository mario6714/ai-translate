import { createSignal } from "solid-js"
import { IModel, IProvider, IProviders, TProviderNames } from "../providers"
import { GetConfig, SaveConfig, OpenConfigDir, OpenConfigWindow } from "../../modules"



export interface IConfig { 
    wsServerUrl: string
    caching: boolean
    targetLanguage: string
    providers: IProviders
    getM: (provider?: string, name?: string) => IModel | undefined
}


export const [ configs, setConfigs ] = createSignal<IConfig>({
    wsServerUrl: "",
    caching: true,
    targetLanguage: "English - US",
    providers: {} as any
} as any)

const prototype = Object.getPrototypeOf(configs())
prototype.getM = function(provider_name?: string, name?: string) { 
    if (provider_name && name) { 
        const provider: Partial<IProvider> = configs().providers[provider_name as TProviderNames] as IProvider
        const model = provider?.models?.find( (m: IModel) => m.name === name)
        return model
    }
}




export async function save_config(config: IConfig) { return await SaveConfig(config as never) }

export async function get_config(): Promise<IConfig | void> { 
    let response: unknown
    for (let _=0; _<3; _++) { 
        response = await GetConfig()
        if (!response) { await new Promise(res => setTimeout(res, 60)) }
        else { break }
    }

    return response as never 
}

export async function open_settings() { 
    return await OpenConfigWindow()
}

export async function open_dir() { return await OpenConfigDir() }



export type CustomSSEInit = { 
    method?: string
    headers?: { 
        Authorization: string
        "Content-Type": string
        Accept?: string
    }
    credentials?: RequestCredentials
}

export class CustomSSE { 
    public url: string | null
    public method: string
    public credentials: CustomSSEInit['credentials']
    public headers: CustomSSEInit['headers'] | undefined
    public request: Promise<Response> | undefined

    constructor( url: string | null, init?: CustomSSEInit ) {
        this.url = url
        this.method = init?.method ?? "GET"
        this.headers = init?.headers
        this.credentials = init?.credentials
    }

    public sendPostRequest(httpBody: Partial<{ [key: string]: any }>, url?: string ) { 
        const requestUrl = url ?? this.url
        const { method, headers, credentials } = this

        if(httpBody && Object.keys(httpBody)?.length && requestUrl && this.method==="POST") {
            this.request = fetch(requestUrl, { 
                method,
                credentials,
                headers,
                body: JSON.stringify(httpBody)
            } )
        }

        return this
    }

    public execute(callback: (message: any) => any) { 
        this.read(callback)
    }

    private async read(callback: (message: any) => any) { 
        const values: any[] = []
        const reader = await this.reader()
        while(true) { 
            const result = await reader?.read();
            let content: string[] | undefined = result.value?.replaceAll('data:', "").replaceAll("\r", "").trim().split("\n")
            .filter(item => item).map(item => JSON.parse(item))
            if(!values.includes(content)) { 
                callback? callback(content) : console.log(content)
                values.push(content)
            }

            if (result.done) { reader?.releaseLock();break }
        }

    }


    private async reader() { //precisa ser o mesmo reader
        const response = await this.request
        if(!response || !response.body) { throw new Error("Request is empty!") }
        return response.body?.pipeThrough(new TextDecoderStream()).getReader()
    }

}



export const Prompt = (text: string) => `
    You are an expert Eroge Game translator who translates Japanese text to ${configs().targetLanguage}.
    You are going to be translating text from a videogame. 
    I will give you lines of text, and you must translate each line to the best of your ability.

    Use the following instructions to respond to user inputs.

    Output Text:
    You output only the translation of each line. translate it into the ${configs().targetLanguage} language

    if, for some reason, you have more than 1 candidate translation for a line, you can put it one below the other. For example:
    "Line 0 Translation 1"
    [empty line]
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

    now translate: ${text}

` //: "Explain the importance of fast language models"


