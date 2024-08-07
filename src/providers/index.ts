import GroqCloud, { GroqHandler } from './GroqCloud'
import HuggingSpacesB, { HfSpaceHandler } from './HuggingSpacesB'
import Google, { GoogleHandler } from './Google'
import Cohere, { CohereHandler } from './Cohere'
import Auto, { AutomaticHandler } from './Auto'
import DeepL, { DeepLHandler } from './DeepL'
import { ISpacesHandler, spacesHandler } from './HuggingSpaces'



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

type IHandler = ((text: string, model_name: string, tag: HTMLTextAreaElement) => Promise<string>) | ISpacesHandler

const Handlers = { 
    GroqCloud: GroqHandler,
    HuggingSpacesB: HfSpaceHandler,
    Google: GoogleHandler,
    Cohere: CohereHandler,
    Auto: AutomaticHandler,
    DeepL: DeepLHandler,
    HuggingSpaces: spacesHandler,
}

export function getHandler(provider_key: string, model_name: string): 
    (text: string, model_name: string, tag: HTMLTextAreaElement) => Promise<string> { 

        const obj: IHandler = Handlers[provider_key as keyof typeof Handlers]
        if (typeof obj !== "function" && obj) { 
            obj.connect(model_name)
            return obj.handler.bind(obj)
        }

        return obj
}

export { GroqCloud, Google, HuggingSpacesB, Cohere, Auto, DeepL }

const Providers: { 
    //HuggingSpaces?: IProvider
    GroqCloud: IProvider
    Google: IProvider
    HuggingSpacesB: IProvider
    Cohere: IProvider
    Auto: IProvider
    DeepL: IProvider

} = { GroqCloud, Google, HuggingSpacesB, Cohere, Auto, DeepL }

export type TProviderKeys = Exclude<keyof typeof Providers, "getM">

export type IProviders = { 
    [key in keyof typeof Providers]: IProvider
}

export default Providers

