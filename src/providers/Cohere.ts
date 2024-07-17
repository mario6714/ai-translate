import { systemPrompt, userPrompt } from "../global/text";
import { configs, CustomSSE, CustomSSEInit } from "../global/configs";



type ICohereInit = { 
    model: string
    chat_history: { 
        role: "system" | "user" | string
        message: string
    }[]
    preamble: string
    message: string
    stream: boolean
    temperature: number
    /* connectors: []
    prompt_truncation: "OFF" */
}

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
            return this.getStream<ICohereResponse, ICohereInit>({ 
                model: this._model,
                message: prompt,
                stream: true,
                temperature: 0.2,
                preamble: systemPrompt
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
    const response = await client.sendPrompt(userPrompt(text))
    if (response) { 
        for await (const chunk of response) { 
            if (chunk?.event_type==="text-generation" && chunk?.text) { tag.value += chunk.text }
            if (tag.value.length > 300) { client.close() ; break }
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