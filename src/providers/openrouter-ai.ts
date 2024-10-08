import { systemPrompt, userPrompt } from "../global/text";
import { configs, CustomSSE, CustomSSEInit } from "../global/configs";



export interface ChatCompletionChunk { 
  id: string;                        // Identificador único do chunk
  object: string;                    // Geralmente 'chat.completion.chunk'
  created: number;                   // Timestamp da criação do chunk
  model: string;                     // Nome do modelo usado (ex: "gpt-4-0314")
  choices: Array<{
      index: number;                   // Índice da escolha (geralmente 0 para uma única resposta)
      delta: {
        content?: string;              // Conteúdo parcial da resposta (incremental)
      };
      finish_reason: string | null;    // Motivo para terminar (ex: 'stop' ou null durante o stream)
  }>;
}

const models = { 
    "meta-llama": "meta-llama/llama-3.2-90b-vision-instruct"
}


class OpenRouterChat extends CustomSSE { 
    readonly model?: string
    constructor(url: string, init: CustomSSEInit & { model: string }) { 
        super(url, init)
        if (init?.model) { this.model = models[init.model as keyof typeof models] }
    }

    async sendPrompt(prompt: string) { 
        if (this.model) { 
            return this.getStream<any, ChatCompletionChunk>({ 
                model: this.model,
                messages: [ 
                    { 
                      role: "system", 
                      content: systemPrompt 
                    }, { 
                      role: "user",
                      content: prompt
                    }
                ],
                stream: true
            })

        }
    }

}


export async function OpenRouterHandler(text: string, model_name: string, tag: HTMLTextAreaElement) { 
    const API_KEY = configs().providers?.OpenRouter?.api_key
    if (!text || !tag || !model_name || !API_KEY) { return "" }
    const client = new OpenRouterChat("https://openrouter.ai/api/v1/chat/completions", { 
        model: model_name,
        headers: { Authorization: "Bearer "+API_KEY }
    })

    tag.value = ""
    const stream = await client.sendPrompt(userPrompt({ text }))
    if (stream) { 
        for await (const chunk of stream) { 
          const text = chunk.choices[0].delta.content;
          tag.value = text;
        }
    }

    return tag.value
}


export default { 
    provider_name: "OpenRouter AI",
    about_url: "https://openrouter.ai/settings/keys",
    api_key: undefined,
    models: [ 
        { 
          name: "meta-llama/llama-3.2-90b-vision-instruct",
          owned_by: "meta-llama",
          auto_fetch: false
        }, { 
          name: "meta-llama/llama-3.1-405b-instruct:free",
          owned_by: "meta-llama",
          auto_fetch: false
        }, { 
          name: "openai/gpt-3.5-turbo",
          owned_by: "openai",
          auto_fetch: false
        }, { 
          name: "openai/gpt-3.5-turbo-instruct",
          owned_by: "openai",
          auto_fetch: false
        }, { 
          name: "openai/gpt-4o",
          owned_by: "openai",
          auto_fetch: false
        }, { 
          name: "openai/gpt-4o-mini",
          owned_by: "openai",
          auto_fetch: false
        }, { 
          name: "openai/gpt-4o-mini-2024-07-18",
          owned_by: "openai",
          auto_fetch: false
        }, { 
          name: "openai/o1-mini",
          owned_by: "openai",
          auto_fetch: false
        }, { 
          name: "openai/o1-mini-2024-09-12",
          owned_by: "openai",
          auto_fetch: false
        }, 
    ]
}

/*
    microsoft/wizardlm-2-8x22b
    cognitivecomputations/dolphin-mixtral-8x7b
    nousresearch/nous-hermes-yi-34b
    sophosympatheia/midnight-rose-70b
    databricks/dbrx-instruct
    alpindale/magnum-72b
    anthracite-org/magnum-v2-72b

    anthropic/claude-3-opus:beta
    anthropic/claude-3-opus
    anthropic/claude-3-sonnet:beta
    anthropic/claude-3-sonnet
    anthropic/claude-3-haiku:beta
    anthropic/claude-3-haiku
    anthropic/claude-3.5-sonnet:beta
    anthropic/claude-3.5-sonnet

    openai/gpt-4o-2024-05-13
    openai/gpt-4o-2024-08-06 (cheaper)
    openai/chatgpt-4o-latest
    cohere/command-r-plus
    cohere/command-r-plus-04-2024
    cohere/command-r-plus-08-2024
    meta-llama/llama-3-70b-instruct
    meta-llama/llama-3.1-405b-instruct
    meta-llama/llama-3.1-405b
    nousresearch/hermes-3-llama-3.1-405b:extended
    nousresearch/hermes-3-llama-3.1-405b
    nousresearch/hermes-3-llama-3.1-405b:free


    battles:
        4o vs o1 mini
        hermes vs llama
*/




/* import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: $OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": $YOUR_SITE_URL, // Optional, for including your app on openrouter.ai rankings.
    "X-Title": $YOUR_SITE_NAME, // Optional. Shows in rankings on openrouter.ai.
  }
})

export async function main() {
  const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-3.2-90b-vision-instruct",
    messages: [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What's in this image?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
            }
          }
        ]
      }
    ]
  })

  console.log(completion.choices[0].message)
}
 */