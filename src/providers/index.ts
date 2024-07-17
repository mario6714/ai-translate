import GroqCloud, { GroqHandler } from './GroqCloud'
import HfSpaces, { HfSpaceHandler } from './HuggingSpaces'
import Google, { GoogleHandler } from './Google'
import Cohere, { CohereHandler } from './Cohere'
import Auto, { AutomaticHandler } from './Auto'
import DeepL, { DeepLHandler } from './DeepL'



export interface IModel { 
    owned_by: string
    name: string
    enabled?: boolean
    index?: number
}

export interface IProvider { 
    provider_name: string
    about_url: string | null
    models: IModel[]
    api_key?: string
}


export { GroqCloud, Google, HfSpaces, Cohere, Auto, DeepL }

export const Handlers: { 
    [key: string]: (text: string, model_name: string, tag: HTMLTextAreaElement) => Promise<string>
} = { 
    GroqCloud: GroqHandler,
    HfSpaces: HfSpaceHandler,
    Google: GoogleHandler,
    Cohere: CohereHandler,
    Auto: AutomaticHandler,
    DeepL: DeepLHandler
}

const Providers: { 
    GroqCloud: IProvider
    Google: IProvider
    HfSpaces: IProvider
    Cohere: IProvider
    Auto: IProvider
    DeepL: IProvider

} = { GroqCloud, Google, HfSpaces, Cohere, Auto, DeepL }

export type TProviderKeys = Exclude<keyof typeof Providers, "getM">

export type IProviders = { 
    [key in keyof typeof Providers]: IProvider
}

export default Providers

// https://ai.google.dev/
// https://huggingface.co/meta-llama/Meta-Llama-3-70B-Instruct