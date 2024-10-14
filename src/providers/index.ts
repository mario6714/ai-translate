import Google, { GoogleHandler } from './Google'
import GroqCloud, { GroqHandler } from './GroqCloud'
import HuggingSpaces, { HuggingSpacesHandler } from './HuggingSpaces'
import Cohere, { CohereHandler } from './Cohere'
import HuggingFace, { HuggingFaceHandler } from './HuggingFace'
import Auto, { AutomaticHandler } from './Auto'
import OpenRouter, { OpenRouterHandler } from './openrouter-ai'



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
    HuggingSpaces: HuggingSpacesHandler,
    OpenRouter: OpenRouterHandler
}

export function getHandler(provider_key: string, _: string): 
    (text: string, model_name: string, tag: HTMLTextAreaElement) => Promise<string> { 
        return Handlers[provider_key as keyof typeof Handlers]
}

export { GroqCloud, Google, HuggingFace, Cohere, Auto, HuggingSpaces, OpenRouter }

const Providers = { GroqCloud, Google, HuggingFace, Cohere, Auto, HuggingSpaces, OpenRouter }

export type TProviderKeys = Exclude<keyof typeof Providers, "getModel">

export type IProviders = { 
    [key in keyof typeof Providers]: IProvider
}

export default Providers as Omit<typeof Providers, 'getModel'>


