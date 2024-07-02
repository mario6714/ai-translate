import { CustomSSE, CustomSSEInit, Prompt, configs } from "../global/configs";



function isUuid(string: string) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(string);
}


class HfChat extends CustomSSE { 
    public conversationId: string | undefined
    public lastId: string | undefined

    constructor( url: string | null, init?: CustomSSEInit ) { 
        super(url, init)
    }

    async createConversation(model: string) { 
        const { name, owned_by } = HuggingModels.find(m => m.name === model) ?? {}
        const { conversationId } = await this.sendPostRequest({ 
            model: owned_by+"/"+name,
            preprompt: ""
        }, "https://huggingface.co/chat/conversation")
        .request?.then(response => response.status===200? response.json() : response.text())
        this.conversationId = conversationId
        return conversationId
    }

    async getLastId() { 
        if(this.conversationId && this.headers?.Authorization) { 
            const items: string[] = await fetch(`https://huggingface.co/chat/conversation/${this.conversationId}/__data.json?x-sveltekit-invalidated=11`, { 
                headers: this.headers

            }).then(response => response.status===200? response.json() : null)
            .then(response => { 
                return response?.nodes[1].data.filter( (item:any) => isUuid(item) )
            })

            this.lastId = items.at(-1)
            return this.lastId
        }
    }

    async sendPrompt(prompt: string, model: string) { 
        if(!this.conversationId) { await this.createConversation(model) }
        this.url = ` https://huggingface.co/chat/conversation/${this.conversationId}`
        await this.getLastId()

        if(this.conversationId && this.lastId) {
            return this.sendPostRequest( {
                inputs: prompt,
                id: this.lastId,
                is_retry: false,
                is_continue: false,
                web_search: false,
                files: []
            } )
        }
    }


}



export async function HfHandler(text: string, model_name: string, tag: HTMLTextAreaElement): Promise<string> { 
    configs()
    const API_KEY = ""//configs().providers?.HuggingFace?.api_key
    if (!text || !tag || !model_name || !API_KEY) { return "" }
    const hf = new HfChat(null, { 
        method: "POST",
        headers: { 
            "Authorization": "Bearer"+" "+API_KEY, 
            'Content-Type': 'application/json',
        }
    })


    tag.value = ""
    await hf?.sendPrompt(Prompt(text), model_name)
    hf?.execute( (data: any) => { console.log(data)
        /* data?.forEach( (response:any) => { 
            if(response?.choices) {
                const text = response?.choices[0].delta.content
                if(tag && text) { tag.value += text }
            }
        } ) */
    })

    return tag.value

}


const HuggingModels = [
    {
        name: "Meta-Llama-3-70B-Instruct",
        owned_by: "meta-llama",
        enabled: undefined
    }, {
        name: "c4ai-command-r-plus",
        owned_by: "CohereForAI",
        enabled: undefined
    }, {
        name: "zephyr-orpo-141b-A35b-v0.1",
        owned_by: "HuggingFaceH4",
        enabled: undefined
    }, {
        name: "Mixtral-8x7B-Instruct-v0.1",
        owned_by: "mistralai",
        enabled: undefined
    }, {
        name: "Nous-Hermes-2-Mixtral-8x7B-DPO",
        owned_by: "NousResearch",
        enabled: undefined
    }, 
]



export default { 
    provider_name: "HuggingFace",
    about_url: "https://huggingface.co/docs/hub/security-tokens",
    api_key: undefined,
    models: HuggingModels
}