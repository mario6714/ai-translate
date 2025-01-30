import { HfInference } from "@huggingface/inference";
import { configs } from "../global/configs";
import { systemPrompt, userPrompt } from "../global/text";


export async function HuggingFaceHandler(text: string, model_name: string, tag: HTMLTextAreaElement) { 
    const API_KEY = configs().providers?.HuggingFace?.api_key
    if (!text || !tag || !model_name || !API_KEY) { return "" }
    const inference = new HfInference(API_KEY)

    tag.value = ""
    const stream = inference.chatCompletionStream( {
        model: model_name,
        messages: [ 
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt({ text }) }
        ],
        temperature: 0,
        max_tokens: 1024,
        top_p: 0.3
    } )
    for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
            const newContent = chunk?.choices?.[0]?.delta?.content;
            if (newContent) { tag.value += newContent; }
            if (tag.value?.length > 300) { location.reload() ; break }
        }
    }

    return tag.value
}


export default { 
    provider_name: "HuggingFace",
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
        }, { 
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
        },*/ {
            name: "deepseek-ai/DeepSeek-R1",
            owned_by: "DeepSeek AI",
            auto_fetch: true
        }, {
            name: "deepseek-ai/DeepSeek-V3",
            owned_by: "DeepSeek AI",
            auto_fetch: true
        }, {
            name: "Qwen/Qwen2.5-72B-Instruct",
            owned_by: "Qwen",
            auto_fetch: true
        }, {
            name: "HuggingFaceH4/starchat2-15b-v0.1",
            owned_by: "HuggingFaceH4",
            auto_fetch: true
        }, {
            name: "01-ai/Yi-1.5-34B-Chat",
            owned_by: "01-ai",
            auto_fetch: true
        }, {
            name: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            owned_by: "mistralai",
            auto_fetch: true
        }, {
            name: "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
            owned_by: "NousResearch",
            auto_fetch: true
        }, 
    ]
}