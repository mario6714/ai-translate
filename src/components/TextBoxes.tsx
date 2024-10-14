import { Show, createEffect, createSignal } from "solid-js"
import { configs, open_settings, enabledModels, getEnabled } from "../global/configs"
import TextBox from "../components/TextBox"



export default function TextBoxes() { 
    const [ hover, setHover ] = createSignal(false)

    createEffect(() => { 
        document.addEventListener("dragstart", (e: any) => {
            e.target.classList.add("dragging");
        });

        document.addEventListener('dragexit', (e) => { 
            e.preventDefault()
        })
    })


    function dragHandler(e: DragEvent & {
        currentTarget: HTMLElement;
        target: Element;
    }) { 

        const dragging = document.querySelector('.dragging') as HTMLElement
        for (let element of Array.from(e.currentTarget.children)) { 
            const box = element.getBoundingClientRect()
            //const boxCenterY = box.y + box.height / 2;
            if (e.clientY >= box.y && e.clientY <= (box.y+box.height)) { 
                const modelA = configs().getModel(dragging?.getAttribute('providerKey'), dragging?.getAttribute('modelName'))
                const modelB = configs().getModel(element.getAttribute('providerKey'), element.getAttribute('modelName'))
                if (typeof modelA?.index==="number" && typeof modelB?.index==="number") { 
                    modelA.index = modelB.index
                    modelB.index += 0.5
                    getEnabled()
                }
            }
        }

        dragging?.classList.remove("dragging")
        e.stopPropagation()
    }


    return ( 
        <main class="flex flex-col gap-5" onmouseenter={ () => { 
            if(!hover()) { setHover(true) }
        } } onmouseleave={ () => { 
            if(hover()) { setHover(false) }
        } }>

            <Show when={(hover())}>
                <button class="fixed top-1 right-3" onclick={open_settings}>
                    <svg class="w-8 h-8 fill-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </button>
            </Show>


            <div class="flex flex-col flex-wrap" onDrop={ dragHandler } onDragOver={(e) => {e.preventDefault()}}>
                { enabledModels()?.map( (model, index) => 
                    <TextBox modelName={model.name} providerKey={model.provider_key} index={index} />
                ) }
            </div>

        </main>
    )
}

