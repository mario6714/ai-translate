import GroqCloud, { GroqHandler } from './GroqCloud'
import HfSpaces, { HfSpaceHandler } from './hf-spaces'
import Google, { GoogleHandler } from './Google'
import Cohere, { CohereHandler } from './Cohere'



export interface IModel { 
    owned_by: string
    name: string
    enabled?: boolean
    index?: number
}

export interface IProvider { 
    provider_name: string
    about_url: string
    models: IModel[]
    api_key?: string
}


export { GroqCloud, Google, HfSpaces, Cohere }

export const Handlers: { 
    [key: string]: (text: string, model_name: string, tag: HTMLTextAreaElement) => Promise<string>
} = { 
    GroqCloud: GroqHandler,
    HfSpaces: HfSpaceHandler,
    Google: GoogleHandler,
    Cohere: CohereHandler
}

const Providers: { 
    GroqCloud: IProvider
    Google: IProvider
    HfSpaces: IProvider
    Cohere: IProvider

} = { GroqCloud, Google, HfSpaces, Cohere }

export type TProviderNames = Exclude<keyof typeof Providers, "getM">

export type IProviders = { 
    [key in keyof typeof Providers]: IProvider
}

export default Providers

// https://ai.google.dev/
// https://huggingface.co/meta-llama/Meta-Llama-3-70B-Instruct