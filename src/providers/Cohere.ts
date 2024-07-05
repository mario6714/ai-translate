import { configs, CustomSSE, CustomSSEInit, Prompt } from "../global/configs";



type ICohereResponse = {
    "is_finished": boolean,
    "event_type": "stream-start" | "text-generation" | "stream-end",
    "generation_id"?: string,
    "finish_reason"?: string,
    "text"?: string,
    "response"?: { 
        "finish_reason": string,
        "generation_id": string,
        "response_id": string,
        "text": string,
        "meta": Record<string, any>
        "chat_history": { 
            "role": string,
            "message": string
        }[]
    }
}

class CohereChat extends CustomSSE { 
    private _model?: string
    constructor(url: string, init: CustomSSEInit & { model: string }) { 
        super(url, init)
        if (init?.model) { this._model = init.model }
    }

    get model() { return this._model }

    async sendPrompt(prompt: string) { 
        if (this._model) { 
            return this.getStream<ICohereResponse>({ 
                model: this._model,
                message: prompt,
                stream: true,
            })
        }
    }

}


export async function CohereHandler(text: string, model_name: string, tag: HTMLTextAreaElement) { 
    const API_KEY = configs().providers?.Cohere?.api_key
    if (!text || !tag || !model_name || !API_KEY) { return "" }
    const client = new CohereChat("https://api.cohere.com/v1/chat", { 
        model: model_name,
        headers: { Authorization: "Bearer "+API_KEY }
    })

    tag.value = ""
    const response = await client.sendPrompt(Prompt(text))
    if (response) { 
        for await (const chunk of response) { 
            if (chunk?.event_type==="text-generation" && chunk?.text) { tag.value += chunk.text }
        }
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
}