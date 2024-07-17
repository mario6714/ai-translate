import { CustomSSE, CustomSSEInit, configs } from "../global/configs";
import { systemPrompt, userPrompt } from "../global/text";



type HuggingSpacesInit = { 
    model: string,
    messages: { 
        role: "system" | "user" | string,
        content: string
    }[]
    temperature: number,
    top_p: number,
    max_tokens: number,
    use_cache: boolean,
    stream: boolean
}

type HuggingSpacesResponse = { 
    "created": number,
    "id": string
    "object": string
    "model": string
    "choices": {
        "index": number,
        "delta": {
            "content": string
        },
        "finish_reason": any
    }[]
}

class HfSpace extends CustomSSE { 
    private _model?: string
    constructor( url: string, init?: CustomSSEInit & { model: string } ) { 
        super(url, init)
        if (init?.model) { this._model = init.model }
    }

    get model() { return this._model }


    async sendPrompt(prompt: string) { 
        if (this._model) { 
            return this.getStream<HuggingSpacesResponse, HuggingSpacesInit>( { 
                model: this._model,
                messages: [
                    { 
                        role: "system",
                        content: systemPrompt
                    }, {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2,
                top_p: 0.45,
                max_tokens: -1,
                use_cache: false,
                stream: true
            });
        }
    }

}



export async function HfSpaceHandler(text: string, model_name: string, tag: HTMLTextAreaElement): Promise<string> { 
    // https://shuddho-hfllmapi.hf.space/api/v1/chat/completions
    // https://hansimov-hf-llm-api.hf.space/api/v1/chat/completions
    // https://lintasmediadanawa-hf-llm-api.hf.space/api/v1/chat/completions
    const API_KEY = configs().providers?.HfSpaces?.api_key
    if (!text || !tag || !model_name || !API_KEY) { return "" }
    const hf = new HfSpace("https://lintasmediadanawa-hf-llm-api.hf.space/api/v1/chat/completions", { 
        headers: { "Authorization": "Bearer"+" "+API_KEY },
        model: model_name
    })


    tag.value = ""
    const stream = await hf.sendPrompt(userPrompt(text))
    if (stream) { 
        for await (const chunk of stream) { 
            if(chunk?.choices) {
                const text = chunk?.choices?.[0]?.delta?.content
                if(tag && text) { tag.value += text }
            }
        }
    }

    return tag.value

}



export default { 
    provider_name: "HfSpaces",
    about_url: "https://huggingface.co/docs/hub/security-tokens",
    api_key: undefined,
    models: [
        /*{
            name: "llama3-70b",
            owned_by: "Meta",
            enabled: undefined
        }, {
            name: "command-r-plus",
            owned_by: "CohereForAI",
            enabled: undefined
        }, {
            name: "zephyr-141b",
            owned_by: "Huggingface",
            enabled: undefined
        }, */{ 
            name: "openchat-3.5",
            owned_by: "OpenChat",
            enabled: undefined
        }, { 
            name: "Qwen2-72B",
            owned_by: "Qwen",
            enabled: undefined
        }, {
            name: "gpt-3.5-turbo",
            owned_by: "OpenAI",
            enabled: undefined
        }, {
            name: "yi-1.5-34b",
            owned_by: "01-ai",
            enabled: undefined
        }, {
            name: "mixtral-8x7b",
            owned_by: "mistralai",
            enabled: undefined
        }, {
            name: "nous-mixtral-8x7b",
            owned_by: "NousResearch",
            enabled: undefined
        }, 
    ]
}


// https://huggingface.co/spaces/lintasmediadanawa/hf-llm-api
// https://huggingface.co/spaces/Hansimov/hf-llm-api
// https://huggingface.co/spaces/Shuddho/HFLLMAPI
// https://huggingface.co/spaces/kenken999/fastapi_django_main