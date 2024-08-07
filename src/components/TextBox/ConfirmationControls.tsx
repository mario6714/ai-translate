import { IText, save_text } from "../../global/text"
import { SetStoreFunction } from "solid-js/store"



export type ITextStore = IText & { 
    editing: boolean
}

type IConfirmationControlsProps = { 
    store: [ITextStore, SetStoreFunction<ITextStore>]
    textarea: HTMLTextAreaElement | undefined
}

export default function ConfirmationControls({store, textarea}: IConfirmationControlsProps) { 
    const [ text, setText ] = store

    return(
        <div class="flex flex-col justify-center items-center gap-4 m-2">
            <button onclick={ () => { 
                if (text.editing) { setText('editing', false) }
                if (text.translated !== textarea?.value && textarea && textarea?.value) { 
                    setText('translated', textarea.value)
                    save_text(text)
                }
            } }>
                <svg class="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
            </button>

            <button onclick={ () => { 
                if (text.editing) { setText('editing', false) }
                if (text.translated !== textarea?.value && textarea && text.translated) { textarea.value = text.translated }
            } }>
                <svg class="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}