import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, } from "@google/generative-ai";
import { configs } from "../global/configs";



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


const PromptGemini = (text: string) => `
    You are an expert Game translator who translates Japanese text to ${configs().targetLanguage}.
    You are going to be translating text from a videogame. 
    I will give you lines of text, and you must translate each line to the best of your ability.

    Use the following instructions to respond to user inputs.

    Input Text: the input text may be in a xml tag, extract the text content from eventual xml or html code. For example:
    <Line1>Line 0 untranslated input text</Line1>

    Output Text:
    You output only the translation of each line. Translate it into the ${configs().targetLanguage} language. For example:
    "Line 0 Translation"
    "Line 1 Translation"
    "Line 2 Translation"

    if, for some reason, you have more than 1 candidate translation for a line, you can put it one below the other. For example:
    "Line 0 Translation 1"
    [empty line]
    "Line 0 Translation 2"

    important: separate the sentences, translate it, and then put it together again. don't translate it literally

    Notes:
    - Don't ever lose a meaning in the translation
    - You translate everything.
    - If there is a speaker, it will be formatted like so: "[speaker_name]: Line 0 Translation" where "speaker_name" is the name of the character talking.
    - "Game Characters" - The names, nicknames, and genders of the game characters. Reference this to know the names, nicknames, and gender of characters in the game.
    - Make sure you always translate the speaker in the line to English.
    - All text in your response must be translated, even if it may be hard to translate.
    - Leave 'Placeholder Text' as is in the line and include it in your response.
    - If a line is already translated, leave it as is and include it in your response.
    - Pay attention to the gender of the subjects and characters. Avoid misgendering characters.
    - Maintain any spacing in the translation.
    - Maintain any code text in brackets if given. (e.g "[Color_0]", "[Ascii_0]", etc)
    - Never include any notes, explanations, dislaimers, or anything similar in your response.
    - "..." can be a part of the dialogue. Translate it as it is and include it in your response.

    now translate: <Line1>${text}</Line1>
`


function MyGoogleChat(key: string, model_name: string) { 
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ 
        model: model_name,
        systemInstruction: "Be the fastest as possible"
    })
    return model
}


export async function GoogleHandler(text: string, model_name: string, tag: HTMLTextAreaElement): Promise<string> { 
    const API_KEY = configs().providers?.Google?.api_key;
    if (!text || !tag || !model_name || !API_KEY) { return "" }
    const gemini = MyGoogleChat(API_KEY, model_name);
    const parts = [
        { text: PromptGemini(text) },
    ];


    tag.value = ""
    const result = await gemini.generateContentStream({ 
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.2 },
        safetySettings,
    });
    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (tag.value.length <= 300) { tag.value += chunkText; }
    }

    return tag.value

}


export default { 
    provider_name: "Google",
    about_url: "https://aistudio.google.com/app/apikey",
    api_key: undefined,
    models: [
        {
            name: "gemini-1.5-pro-latest", // "gemini-pro"
            owned_by: "Google",
            enabled: undefined
        }, {
            name: "gemini-1.5-flash",
            owned_by: "Google",
            enabled: undefined
        }, {
            name: "gemini-1.0-pro",
            owned_by: "Google",
            enabled: undefined
        }, 
    ]
}