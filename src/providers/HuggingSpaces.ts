import { systemPrompt, userPrompt } from "../global/text";
import { Client } from "@gradio/client";


const models = { 
    //"llama-3.1-405b": "aifeifei798/Meta-Llama-3.1-405B-Instruct",
    //"llama-3.1-70b": "aifeifei798/llama-3.1-70b-instruct",
    "llama-3.1-405b": "Nymbo/Llama-3.1-405B-Instruct",
    "llama-3.1-405b-fp8": "as-cle-bert/Llama-3.1-405B-FP8"
}

/* const endpoints = { 
    "llama-3.1-405b": "/chat",
    "llama-3.1-70b": "/chat",
    "llama-3.1-405b-fp8": "/chat"
} */

async function test() {
    const client = await Client.connect(`CohereForAI/c4ai-command-r-plus`, { 
        hf_token: "hf_"
    });

    console.log(client.view_api())
    const result = await client.predict("/generate_response", { 
        user_message: "O que é um derivado vetorial?",
        //input: "O que é um derivado vetorial?"
    })

    console.log(result)
    /* for await (const msg of result) { 
        if (msg.type === "data") { 
            console.log(msg.data); 
        }
    } */
}

declare global { 
    interface Window { test: typeof test }
}
window.test = test


export interface ISpacesHandler { 
    client: Client | null
    handler(text: string, model_name: string, tag: HTMLTextAreaElement): Promise<string>
    connect(model_name: string): Promise<Client | null>
}

export class SpacesHandler implements ISpacesHandler { 
    client: Client | null = null

    async connect(model_name: string) { 
        const API_KEY = "hf_"
        if (!API_KEY || !model_name) { return null }
        const client = await Client.connect(models[model_name as never], { 
            hf_token: API_KEY
        });
        this.client = client
        return client
    }

    async handler(text: string, _: string, tag: HTMLTextAreaElement): Promise<string> { 
        tag.value = ""
        const result = this.client?.submit("/chat", { 		
                message: userPrompt({ text }), 
                system_message: systemPrompt, 
                max_tokens: 2048, 
                temperature: 0,
                top_p: 0.1, 
        });


        if (result) { 
            for await (const msg of result) { 
                if (msg.type === "data") { 
                    tag.value = msg.data[0] as string
                    //if (tag.value.length > 300) { result.cancel() ; break }
                }
            }
        }

        return tag.value
    }
}

export const spacesHandler = new SpacesHandler()


export default { 
    provider_name: "HuggingSpaces",
    about_url: null,//"https://huggingface.co/docs/hub/security-tokens",
    api_key: undefined,
    models: [
        {
            name: "llama-3.1-405b",
            owned_by: "Meta",
            enabled: undefined
        }, { 
            name: "llama-3.1-405b-fp8",
            owned_by: "Meta",
            enabled: undefined
        }, /* {
            name: "llama-3.1-70b",
            owned_by: "Meta",
            enabled: undefined
        },  */
    ]
}