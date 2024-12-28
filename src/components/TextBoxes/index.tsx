import { Show, createEffect, createSignal } from "solid-js"
import { configs, enabledModels, getEnabled } from "../../global/configs"
import TextBox from "../../components/TextBox"
import Slider from "./slider"
import ButtonsPanel from "./ButtonsPanel"
import { IModel } from "../../providers"
import "./style.css"



export default function TextBoxes() { 
    const [ hover, setHover ] = createSignal(false)
    let section: HTMLElement | undefined

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
                    const smaller = (modelA.index<modelB.index? modelA : modelB) as IModel & { index: number }
                    modelA.index = modelB.index
                    smaller.index += 0.5
                    getEnabled()
                }
            }
        }

        dragging?.classList.remove("dragging")
        e.stopPropagation()
    }


    return ( 
        <main class="flex flex-col" onmouseenter={ () => { 
            if(!hover()) { setHover(true) }
        } } onmouseleave={ () => { 
            if(hover()) { setHover(false) }
        } }>

            <Show when={(hover())}>
                <ButtonsPanel />
            </Show>


            <section class="flex flex-col h-screen flex-wrap overflow-x-scroll scroll-smooth" ref={section}
             onDrop={ dragHandler } onDragOver={(e) => {e.preventDefault()}}>
                { enabledModels()?.map( (model, index) => 
                    <TextBox modelName={model.name} providerKey={model.provider_key} index={index} />
                ) }
            </section>

            <Show when={section && section.scrollWidth >= 2 * section.offsetWidth}>
                <Slider tag={section as HTMLElement} />
            </Show>

        </main>
    )
}

