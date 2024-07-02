import { Show, createMemo, createSignal } from "solid-js";
import ModelsList from "./ModelsList";


export default function Provider( {providerName: provider_name}: { providerName: string } ) { 
    const [ toggle, setToggle ] = createSignal(false)
    const rotate = createMemo(() => toggle()? '' : '-rotate-90')


    return( 
        <section>
            <button class="w-full flex gap-2" onclick={() => setToggle(!toggle())}>
                <svg class={`w-6 h-6 ${rotate()}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
                {provider_name}
            </button>

            <Show when={toggle()}>
                <ModelsList provider={provider_name} />
            </Show>
        </section>
    )
}