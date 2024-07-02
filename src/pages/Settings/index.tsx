import { For, Show } from "solid-js";
import { configs } from "../../global/configs";
import Models from "../../providers";
import OpenButton from "./OpenButton";
import WsInput from "./WsInput";
import Provider from "./Provider";
import CachingToggle from "./CachingToggle";
import Lang from "./Lang";
import './style.css';



export default function Settings() { 
    const providers = Object.keys(Models)

    return( 
        <Show when={configs()}>
            <main class="h-screen w-full px-10 flex flex-col justify-between">
                <section class="py-8 flex flex-col gap-8">
                    <h1 class="text-5xl font-bold">Settings</h1>
                    <div>
                        <WsInput />
                        <OpenButton />
                        <CachingToggle />
                        <Lang />
                    </div>
                    <h2 class="text-xl">Translation engines:</h2>
                    <For each={providers}>
                        { provider_name => <Provider providerName={provider_name} />}
                    </For>
                </section>
            </main>
        </Show>
    )
}



