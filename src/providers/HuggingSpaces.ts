import { systemPrompt, userPrompt } from "../global/text";
import { Client } from "@gradio/client";


const models = { 
    //"llama-3.1-405b": "aifeifei798/Meta-Llama-3.1-405B-Instruct",
    //"llama-3.1-70b": "aifeifei798/llama-3.1-70b-instruct",
    "llama-3.1-405b": "Nymbo/Llama-3.1-405B-Instruct",
    "llama-3.1-405b-fp8": "as-cle-bert/Llama-3.1-405B-FP8",
    "Qwen-2.5-72B-Instruct": "Nymbo/Qwen-2.5-72B-Instruct",
    "Command-R-Plus-08-2024": "Nymbo/Command-R-Plus-08-2024"
}

/* const endpoints = { 
    "llama-3.1-405b": "/chat",
    "llama-3.1-70b": "/chat",
    "llama-3.1-405b-fp8": "/chat"
} */



export interface IHugSpacesChat { 
    model_name: string
    sendPrompt(text: string): Promise<unknown>
}

class HugSpacesChat implements IHugSpacesChat { 
    readonly model_name: string
    private client: Client | null = null
    private conn: Promise<boolean | null>

    constructor(model_name: string) { 
        this.model_name = model_name
        this.conn = this.connect(model_name)
    }

    private async connect(model_name: string) { 
        if (!model_name) { return null }
        return await Client.connect(models[model_name as never])
        .then(client => { 
            this.client = client
            return true

        }).catch(() => false)
    }

    async sendPrompt(text: string) { 
        const conn_status = await this.conn
        if (conn_status) { 
            return await this.client?.submit("/chat", { 		
                message: userPrompt({ text }), 
                system_message: systemPrompt, 
                max_tokens: 1, 
                temperature: 0,
                top_p: 0.1, 
            } as any) as any;
        }
    }

}

export async function HuggingSpacesHandler(text: string, model_name: string, tag: HTMLTextAreaElement): Promise<string> { 
    const client = new HugSpacesChat(model_name)
    const stream = await client.sendPrompt(text)


    tag.value = ""
    if (stream) { 
        for await (const msg of stream) { 
            if (msg.type === "data") { 
                tag.value = msg.data[0] as string
                //if (tag.value.length > 300) { result.cancel() ; break }
            }
        }
    }

    return tag.value
}


export default { 
    provider_name: "HuggingSpaces",
    about_url: null,//"https://huggingface.co/docs/hub/security-tokens",
    api_key: undefined,
    models: [ 
        {
            name: "Qwen-2.5-72B-Instruct",
            owned_by: "Qwen",
        }, /*{
            name: "llama-3.1-405b",
            owned_by: "Meta",
            enabled: undefined
        }, { 
            name: "llama-3.1-405b-fp8",
            owned_by: "Meta",
            enabled: undefined
        }, {
            name: "llama-3.1-70b",
            owned_by: "Meta",
            enabled: undefined
        },  */
    ]
}