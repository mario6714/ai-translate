import { CustomSSE, CustomSSEInit, Prompt, configs } from "../global/configs";



type IResponse = {
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
    constructor( url: string, init?: CustomSSEInit ) { 
        super(url, init)
    }

    sendPrompt(prompt: string, model: string) { 
        return this.sendPostRequest( { 
            model: model,
            messages: [
              {
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



export async function HfSpaceHandler(text: string, model_name: string, tag: HTMLTextAreaElement): Promise<string> { 
    // https://shuddho-hfllmapi.hf.space/api/v1/chat/completions
    // https://hansimov-hf-llm-api.hf.space/api/v1/chat/completions
    const API_KEY = configs().providers?.HfSpaces?.api_key
    if (!text || !tag || !model_name || !API_KEY) { return "" }
    const hf = new HfSpace("https://hansimov-hf-llm-api.hf.space/api/v1/chat/completions", { 
        method: "POST",
        headers: { 
            "Authorization": "Bearer"+" "+API_KEY, 
            'Content-Type': 'application/json',
            "Accept": "application/json"
        }
    })


    tag.value = ""
    hf?.sendPrompt(Prompt(text), model_name).execute( (data: IResponse[] | undefined) => { 
        data?.forEach(response => { 
            if(response?.choices) {
                const text = response?.choices[0].delta.content
                if(tag && text) { tag.value += text }
            }
        } )
    })

    return tag.value

}



export default { 
    provider_name: "HfSpaces",
    about_url: "https://huggingface.co/docs/hub/security-tokens",
    api_key: undefined,
    models: [
        {
            name: "llama3-70b",
            owned_by: "Meta",
            enabled: undefined
        }, /*{
            name: "command-r-plus",
            owned_by: "CohereForAI",
            enabled: undefined
        }, {
            name: "zephyr-141b",
            owned_by: "Huggingface",
            enabled: undefined
        }, */ {
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


// https://huggingface.co/spaces/Hansimov/hf-llm-api
// https://huggingface.co/spaces/Shuddho/HFLLMAPI
// https://huggingface.co/spaces/kenken999/fastapi_django_main