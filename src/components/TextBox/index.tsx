import { Show, createEffect, createMemo } from "solid-js"
import { SetStoreFunction, createStore } from "solid-js/store"
import { IText, global_text, save_text } from "../../global/text"
import { Handlers, TProviderNames } from "../../providers"
import SaveIcon from "../SaveIcon"
import './style.css'



type ITextBoxProps = { 
    modelName: string 
    provider: string
    index: number
}

type ITextStore = IText & { 
    editing: boolean
}


export default function TextBox( {modelName, provider: provider_name, index}: ITextBoxProps ) { 
    const [ text, setText ] = createStore<ITextStore>({ 
        editing: false,
        translated: "Waiting for text...",
        untranslated: global_text().untranslated
    })
    const textareaStyle = createMemo(() => text.translated==="Waiting for text..."? "italic text-zinc-100" : "")
    const handler = Handlers[provider_name as TProviderNames]
    let textarea: HTMLTextAreaElement | undefined


    async function translate() { 
        if (handler && textarea) { 
            setText('translated', "Loading...")
            const translated = await handler(text.untranslated, modelName, textarea).catch(() => "")
            setText('translated', translated)
            if (index===0) { save_text(text) }
        }
    }


    createEffect( async() => { 
        if (global_text().untranslated !== text.untranslated) { 
            setText('untranslated', global_text().untranslated) 
            let translated = global_text().translated
            if (translated) { 
                if (index===0) { setText('translated', translated) }
                else { setText('translated', "") }
                return
            }

            translate()
        }

    })


    return (
        <section class="w-full flex justify-between">

            <div class="w-full py-1 relative">
                <textarea class={`w-full h-44 p-2 ${textareaStyle()} bg-inherit`} ref={textarea} readonly name="" id="" cols="30" rows="10">
                    { text.translated }
                </textarea>
                <p class="py-1 px-2 absolute bottom-0 text-sm text-placeholder italic">{modelName} - {provider_name}</p>
            </div>

            <Show when={!text.editing} fallback={<ConfirmationControls store={[ text, setText ]} />}>
                <div class="flex flex-col justify-end items-center m-4">
                    <div class="flex flex-col gap-2 items-center">
                            <button onclick={ translate }>
                                <svg class="w-6 h-6 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </button>

                            <button onclick={ () => { 
                                textarea?.attributes.removeNamedItem('readonly')
                                if(!text.editing) { setText('editing', true) }
                            } }>
                                    <svg class="w-6 h-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                            </button>

                            <SaveIcon onClick={() => {
                                if (text.translated) { save_text(text) }
                            } }/>
                    </div>
                </div>
            </Show>

        </section>
    )
}



function ConfirmationControls( {store}: {store: [ITextStore, SetStoreFunction<ITextStore>]} ) { 
    const [ text, setText ] = store
    const textarea = document.querySelector('textarea')

    function toggleEdit() { 
        textarea?.setAttribute('readonly', '')
        if (text.editing) { setText('editing', false) }
    }

    return(
        <div class="flex flex-col justify-center items-center gap-4 m-2">
            <button onclick={ () => { 
                toggleEdit()
                if (text.translated !== textarea?.value && textarea && textarea?.value) { 
                    setText('translated', textarea.value)
                    save_text(text)
                }
            } }>
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
            </button>
            <button onclick={ () => { 
                toggleEdit()
                if (text.translated !== textarea?.value && textarea && text.translated) { textarea.textContent = text.translated }
            } }>
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}