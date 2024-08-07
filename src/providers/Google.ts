import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, } from "@google/generative-ai";
import { configs } from "../global/configs";
import { systemPrompt, userPrompt } from '../global/text'


const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
]


function MyGoogleChat(key: string, model_name: string) { 
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ 
        model: model_name,
        systemInstruction: "Be the fastest as possible\n\n\n"+systemPrompt
    })
    return model
}


export async function GoogleHandler(text: string, model_name: string, tag: HTMLTextAreaElement): Promise<string> { 
    const API_KEY = configs().providers?.Google?.api_key;
    if (!text || !tag || !model_name || !API_KEY) { return "" }
    const gemini = MyGoogleChat(API_KEY, model_name);
    const parts = [
        { text: userPrompt(text) },
    ];


    tag.value = ""
    const result = await gemini.generateContentStream({ 
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.2 },
        safetySettings,
    });

    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        tag.value += chunkText;
        if (tag.value.length > 300) { location.reload() ; break }
    }

    return tag.value

}


export default { 
    provider_name: "Google",
    about_url: "https://aistudio.google.com/app/apikey",
    api_key: undefined,
    models: [
        {
            name: "gemini-1.0-pro",
            owned_by: "Google",
            enabled: undefined,
            auto_fetch: true
        }, {
            name: "gemini-1.5-pro-latest", 
            owned_by: "Google",
            enabled: undefined,
            auto_fetch: true
        }, {
            name: "gemini-1.5-pro", 
            owned_by: "Google",
            enabled: undefined,
            auto_fetch: true
        }, {
            name: "gemini-1.5-pro-exp-0801", 
            owned_by: "Google",
            enabled: undefined,
            auto_fetch: true
        }, {
            name: "gemini-1.5-flash",
            owned_by: "Google",
            enabled: undefined,
            auto_fetch: true
        }, 
    ]
}

// https://ai.google.dev/