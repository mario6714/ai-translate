import { GoogleTranslatorTokenFree } from '@translate-tools/core/translators/GoogleTranslator';
import { YandexTranslator } from '@translate-tools/core/translators/YandexTranslator'
import { TartuNLPTranslator } from '@translate-tools/core/translators/TartuNLPTranslator'
import { configs } from '../global/configs';
import { Fetcher } from '@translate-tools/core/utils/Fetcher';
import { basicFetcher } from '@translate-tools/core/utils/Fetcher/basicFetcher';



export const languageCodes = { 
    "Deutsch": "de",
    "English - US": "en",
    "English - EU": "en",
    "Italiano": "it",
    "Español": "es",
    "Français": "fr",
    "Português - PT": "pt",
    "Português - BR": "pt",
    "Nederlands": "nl",
    "Deitsch": "pdc",
    "русский": "ru",
    "한국어": "ko",
    "简体中文": "zh",
    "繁體中文": "zh",
    "ﺎﻠﻋﺮﺒﻳﺓ": "ar",
    "Japanese": "ja"
};

const lang = () => { 
    const target = configs().targetLanguage as keyof typeof languageCodes
    const lang = languageCodes[target]
    //console.log(target)
    return lang
}

const fetcher: Fetcher = async (url, options) => {
	return basicFetcher('https://corsproxy.io/?' + encodeURIComponent(url), options);
};

export async function GoogleHandler2(text: string) { 
    const translator = new GoogleTranslatorTokenFree({ fetcher });
    return await translator.translate(text, 'auto', lang())
}

async function YandexHandler(text: string) {
    const translator = new YandexTranslator()
    return await translator.translate(text, 'auto', lang())
}

async function TartuHandler(text: string) {
    const translator = new TartuNLPTranslator()
    return await translator.translate(text, 'auto', lang())
}

async function GoogleHandler(text: string) { 
    return await fetch("https://google-translate-serverless-puce.vercel.app/api/translate", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            to: lang(),
            text
        })
    })
    .then(response => response.json())
    .then(response => response?.text)
}

async function DeepLXHandler(text: string) { 
    return await fetch("https://deep-lx-vercel-coral.vercel.app/api/translate", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            text,
            target_lang: lang()
        })
    }).then(response => response.json())
    .then(response => response?.data)
}

const translators = { 
    "google-translate": { execute(text: string) { return GoogleHandler(text) } },
    Yandex: { execute(text: string) { return YandexHandler(text) } },
    TartuNLP: { execute(text: string) { return TartuHandler(text) } },
    DeepLX: { execute(text: string) { return DeepLXHandler(text) } }
}



export async function AutomaticHandler(text: string, engine: string, _: HTMLTextAreaElement) { 
    if (!text || !engine) { return null }
    return await translators[engine as keyof typeof translators]?.execute(text.trim())
}

export default { 
    provider_name: "Automatic Translators",
    about_url: null,
    api_key: undefined,
    models: [
        { 
            name: "google-translate",
            owned_by: "Google",
            enabled: undefined
        }, { 
            name: "DeepLX",
            owned_by: "DeepL",
            //
        }, { 
            name: "Yandex",
            owned_by: "Yandex",
            enabled: undefined
        }, { 
            name: "TartuNLP",
            owned_by: "Tartu University",
            enabled: undefined
        }
    ]
}