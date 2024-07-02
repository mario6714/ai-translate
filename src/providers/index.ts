import GroqCloud, { GroqHandler } from './GroqCloud'
import HfSpaces, { HfSpaceHandler } from './hf-spaces'
//import HuggingFace, { HfHandler } from './HuggingFace'
import Google, { GoogleHandler } from './Google'


export interface IModel { 
    owned_by: string
    name: string
    enabled?: boolean
}

export interface IProvider { 
    provider_name: string
    about_url: string
    models: IModel[]
    api_key?: string
}




export { GroqCloud, Google, HfSpaces }

export const Handlers: { 
    [key: string]: (text: string, model_name: string, tag: HTMLTextAreaElement) => Promise<string>
} = { 
    GroqCloud: GroqHandler,
    HfSpaces: HfSpaceHandler,
    Google: GoogleHandler,
    //HuggingFace: HfHandler
}

const Models = { GroqCloud, Google, HfSpaces }

export type TProviderNames = Exclude<keyof typeof Models, "getM">

export type IProviders = { 
    [key in keyof typeof Models]: IProvider
}

export default Models

// https://ai.google.dev/
// https://huggingface.co/meta-llama/Meta-Llama-3-70B-Instruct