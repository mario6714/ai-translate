import { DeepLTranslator } from '@translate-tools/core/translators/DeepLTranslator';
import { languageCodes } from './Auto';
import { configs } from '../global/configs';


export async function DeepLHandler(text: string, ..._: any[]) { 
    const API_KEY = configs().providers.DeepL.api_key
    if (!text || !API_KEY) { return null }
    const translator = new DeepLTranslator({ 
        apiKey: API_KEY
    })

    return await translator.translate(text.trim(), 'auto', languageCodes[configs().targetLanguage as keyof typeof languageCodes])
}


export default { 
    provider_name: "DeepL",
    about_url: "https://www.deepl.com/pt-BR/pro-api?cta=header-pro-api",
    api_key: undefined,
    models: [
        { 
            name: "DeepL Translator",
            owned_by: "DeepL",
            enabled: undefined
        }, 
    ]
}