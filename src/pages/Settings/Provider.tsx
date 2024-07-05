import { Show, createMemo, createSignal } from "solid-js";
import ModelsList from "./ModelsList";
import Providers, { TProviderKeys } from "../../providers";


export default function Provider( {providerKey: provider_key}: { providerKey: string } ) { 
    const [ toggle, setToggle ] = createSignal(false)
    const rotate = createMemo(() => toggle()? '' : '-rotate-90')
    const provider = Providers[provider_key as TProviderKeys]


    return( 
        <section>
            <button class="w-full py-3 flex gap-2" onclick={() => setToggle(!toggle())}>
                <svg class={`w-6 h-6 ${rotate()}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
                {provider.provider_name}
            </button>

            <Show when={toggle()}>
                <ModelsList provider={provider_key} />
            </Show>
        </section>
    )
}