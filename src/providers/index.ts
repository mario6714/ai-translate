import GroqCloud, { GroqHandler } from './GroqCloud'
import HuggingFace, { HuggingFaceHandler } from './HuggingFace'
import Google, { GoogleHandler } from './Google'
import Cohere, { CohereHandler } from './Cohere'
import Auto, { AutomaticHandler } from './Auto'
import DeepL, { DeepLHandler } from './DeepL-pro'
import HuggingSpaces, { HuggingSpacesHandler } from './HuggingSpaces'



export interface IModel { 
    owned_by: string
    name: string
    auto_fetch?: boolean
    enabled?: boolean
    index?: number
}

export interface IProvider { 
    provider_name: string
    about_url: string | null
    models: IModel[]
    api_key?: string
}

//type IHandler = ((text: string, model_name: string, tag: HTMLTextAreaElement) => Promise<string>)

const Handlers = { 
    GroqCloud: GroqHandler,
    HuggingFace: HuggingFaceHandler,
    Google: GoogleHandler,
    Cohere: CohereHandler,
    Auto: AutomaticHandler,
    DeepL: DeepLHandler,
    HuggingSpaces: HuggingSpacesHandler,
}

export function getHandler(provider_key: string, _: string): 
    (text: string, model_name: string, tag: HTMLTextAreaElement) => Promise<string> { 
        return Handlers[provider_key as keyof typeof Handlers]
}

export { GroqCloud, Google, HuggingFace, Cohere, Auto, DeepL, HuggingSpaces }

const Providers: { 
    HuggingSpaces: IProvider
    GroqCloud: IProvider
    Google: IProvider
    HuggingFace: IProvider
    Cohere: IProvider
    Auto: IProvider
    DeepL: IProvider

} = { GroqCloud, Google, HuggingFace, Cohere, Auto, DeepL, HuggingSpaces }

export type TProviderKeys = Exclude<keyof typeof Providers, "getM">

export type IProviders = { 
    [key in keyof typeof Providers]: IProvider
}

export default Providers

