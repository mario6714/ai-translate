import { Show, createEffect, createMemo, createSignal } from "solid-js"
import { createStore } from "solid-js/store"
import { global_text, save_text } from "../../global/text"
import { configs, IExtendedModel, save_config, setConfigs } from "../../global/configs"
import Providers, { getHandler, TProviderKeys } from "../../providers"
import ConfirmationControls, { ITextStore } from "./ConfirmationControls"
import SaveIcon from "../SaveIcon"
import './style.css'



type ITextBoxProps = { 
    model: IExtendedModel 
    providerKey: string
    index: number
}

type MyDragEvent = DragEvent & {
    currentTarget: HTMLElement;
    target: Element;
}

export type ITextBoxSectionProps = { 
    modelName?: string
    providerKey?: string
}

declare module 'solid-js' {
    namespace JSX { 
        // JSX.HTMLElementTags.section: JSX.HTMLAttributes<HTMLElement>
        interface IntrinsicElements {
            section: JSX.HTMLAttributes<HTMLElement> & ITextBoxSectionProps
        }
    }
}

function setDragOverStyle(e: MyDragEvent) { e.currentTarget.style.border = "2px solid white" }
function rmvDragOverStyle(e: MyDragEvent) { e.currentTarget.style.border = "" }


export default function TextBox( {model, providerKey, index}: ITextBoxProps ) { 
    const [ text, setText ] = createStore<ITextStore>({ 
        editing: false,
        translated: "Waiting for text...",
        untranslated: global_text().untranslated
    })
    const [ dragging, setDragging ] = createSignal(false)
    const handler = getHandler(providerKey, model.name)
    let textarea: HTMLTextAreaElement | undefined
    const provider = Providers[providerKey as TProviderKeys]
    const auto_fetch = createMemo(() => configs().getM(providerKey, model.name)?.auto_fetch)
    const textareaStyle = createMemo(() => text.translated==="Waiting for text..."? "italic text-zinc-100" : "")
    const autoFetchStyle = () => auto_fetch()? "text-green-500" : "text-zinc-500"


    async function translate(options?: {save?: boolean}) { 
        if (handler && textarea && text.untranslated) { 
            const translated = await handler(text.untranslated, model.name, textarea)
            .catch(e => e)
            setText('translated', translated)
            if (index===0 && options?.save) { save_text(text) }
        }
    }


    createEffect( async() => { 
        if (global_text().untranslated !== text.untranslated) { 
            setText('untranslated', global_text().untranslated) 
            let translated = global_text().translated
            if (translated) { 
                if (index===0) { setText('translated', translated) }
                else { setText('translated', "") }

            } else if (model.auto_fetch) { await translate({ save: true }) }

            //console.log(modelName, ":", text.translated) 
        }

    })


    return (
        <section class="w-full flex justify-between" 
         modelName={model.name} providerKey={providerKey} draggable={ dragging() }
         onDragOver={setDragOverStyle} onDragLeave={rmvDragOverStyle} onDrop={rmvDragOverStyle}>

            <div class="w-full py-1 relative">
                <textarea class={`w-full h-44 p-2 ${textareaStyle()} bg-inherit`} 
                 value={text.translated as string} ref={textarea} readonly={!text.editing}
                 name="" id="" cols="30" rows="10" />
                <p class="py-1 px-2 absolute bottom-0 text-sm text-placeholder italic">{model.name} - {provider.provider_name}</p>
            </div>

            <Show when={!text.editing} fallback={
                <ConfirmationControls store={[ text, setText ]} textarea={textarea} />
            }>
                <div class="flex flex-col justify-end items-center m-4">
                    <div class="flex flex-col gap-2 items-center"
                     onDragOver={ e => {e.stopPropagation();e.preventDefault()} }>
                            <button onMouseDown={ () => { 
                                if (!dragging()) { setDragging(true) }
                            } } onMouseUp={ () => { 
                                if (dragging())  { setDragging(false) }
                            } }>
                                <svg class="w-6 h-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
                                </svg>
                            </button>

                            <button class={`${autoFetchStyle()} text-xs p-2 active:opacity-60`}
                             onClick={ () => { 
                                const m = configs().getM(providerKey, model?.name)
                                if(m) { 
                                    m.auto_fetch = !auto_fetch()
                                    setConfigs({ ...configs() })
                                    save_config(configs())
                                }
                             } }>
                                AUTO
                            </button>

                            <button onclick={ () => translate() }>
                                <svg class="w-6 h-6 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </button>

                            <button onclick={ () => { 
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


