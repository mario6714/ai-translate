// humongous bundle
/* import { Prompt, configs } from '../global/configs'
import { CohereClient } from 'cohere-ai'



type ICohereInit = { 
    key: string
    model: string
}

class MyCohereClient extends CohereClient { 
    private _model: string

    constructor(init: ICohereInit) { 
        const { key, model } = init
        super({ 
            token: key
        })
        this._model = model
    }

    get model() { return this._model }


    async sendPrompt(prompt: string) { 
        return await this.chatStream({ 
            model: this._model,
            message: prompt
        })
    }
}


export async function CohereHandler(text: string, model_name: string, tag: HTMLTextAreaElement): Promise<string> { 
    const API_KEY = configs().providers?.Cohere?.api_key
    if (!text || !tag || !model_name || !API_KEY) { return "" }
    const client = new MyCohereClient({ 
        key: API_KEY,
        model: model_name,
    })

    tag.value = ""
    const response = await client.sendPrompt(Prompt(text))
    for await (const _chunk of response) { 
        const chunk = _chunk as any
        const chunkText = chunk.text
        if (chunkText) { tag.value += chunkText }
    }

    return tag.value
}



export default { 
    provider_name: "Cohere",
    about_url: "https://dashboard.cohere.com/api-keys",
    api_key: undefined,
    models: [
        { 
            name: "command-r",
            owned_by: "Cohere",
            enabled: undefined
        }, { 
            name: "command-r-plus",
            owned_by: "Cohere",
            enabled: undefined
        }, { 
            name: "command",
            owned_by: "Cohere",
            enabled: undefined
        }, { 
            name: "command-nightly",
            owned_by: "Cohere",
            enabled: undefined
        }, { 
            name: "command-light",
            owned_by: "Cohere",
            enabled: undefined
        }, { 
            name: "command-light-nightly",
            owned_by: "Cohere",
            enabled: undefined
        }, 
    ]
} */