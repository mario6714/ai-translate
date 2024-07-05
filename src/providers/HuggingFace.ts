import { CustomSSE, CustomSSEInit } from "../global/configs";



function isUuid(string: string) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(string);
}


class HfChat extends CustomSSE { 
    private _conversationId: string | undefined
    private _lastId: string | undefined
    private _model: string

    constructor( url: string | null, init: CustomSSEInit & { model: string } ) { 
        super(url, init)
        this._model = init.model
    }

    get conversationId() { return this._conversationId }
    get lastId() { return this._lastId }
    get model() { return this._model }

    async createConversation() { 
        const { name, owned_by } = HuggingModels.find(m => m.name === this._model) ?? {}
        const { conversationId } = await this.sendPostRequest({ 
            model: owned_by+"/"+name,
            preprompt: ""
        }, "https://huggingface.co/chat/conversation")
        .request?.then(response => response.status===200? response.json() : response.text())
        this._conversationId = conversationId
        return conversationId
    }

    async getLastId() { 
        if(this._conversationId && this.headers?.Authorization) { 
            const items: string[] = await fetch(`https://huggingface.co/chat/conversation/${this._conversationId}/__data.json?x-sveltekit-invalidated=11`, { 
                headers: this.headers

            }).then(response => response.status===200? response.json() : null)
            .then(response => { 
                return response?.nodes[1].data.filter( (item:any) => isUuid(item) )
            })

            this._lastId = items.at(-1)
            return this._lastId
        }
    }

    async sendPrompt(prompt: string) { 
        if(!this._conversationId) { await this.createConversation() }
        this.url = ` https://huggingface.co/chat/conversation/${this._conversationId}`
        await this.getLastId()

        if(this._conversationId && this._lastId) { prompt
            return this.getStream("")
        }
    }


}



export async function HfHandler(text: string, model_name: string, _?: HTMLTextAreaElement): Promise<string> { 
    const API_KEY = ""//configs().providers?.HuggingFace?.api_key
    //if (!text || !tag || !model_name || !API_KEY) { return "" }
    const hf = new HfChat(null, { 
        headers: { "Authorization": "Bearer "+API_KEY },
        model: model_name
    })


    const response = await hf.sendPrompt(text)
    if(response) { 
        for await (const chunk of response) { console.log(chunk) }
    }

    return ""
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

