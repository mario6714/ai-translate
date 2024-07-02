import { Show, createEffect } from "solid-js";
import { MyClipboardMonitor, MyWs, getEnabled, enabledModels } from "../global/text";
import { configs, get_config, setConfigs } from "../global/configs";
import Settings from "./Settings"
import TextBoxes from "../components/TextBoxes";
import SkeletonLoading from "../components/SkeletonLoading";
import SaveConfigsButton from "../components/SaveConfigsButton";


export default function App() { 
    const myws = new MyWs()
    const monitor = new MyClipboardMonitor()

    createEffect(() => { 
        if (enabledModels()) {
            if (configs().wsServerUrl && !myws.isOpen()) { 
                myws.setUrl(configs().wsServerUrl)
                if (monitor.isRunning()) { monitor.stop() }
            }
            else if (!configs().wsServerUrl && !monitor.isRunning()) { 
                monitor.start()
                if (myws.isOpen()) { myws.close() }
            }
        }

    } )

    createEffect(() => { 
        window.onfocus = async function() { 
            const result = JSON.stringify(await get_config())?.replaceAll("\n", "").replaceAll(" ", "").trim()
            const configs_string = JSON.stringify(configs())?.replaceAll("\n", "").replaceAll(" ", "").trim()
            if (result !== configs_string && result) { 
                setConfigs( JSON.parse(result) )
                getEnabled()
            }
        }

        //setInterval(() => console.log(document.hidden), 1000)
    } )


    return ( 
        <Show when={enabledModels()!==null} fallback={<SkeletonLoading />}>
            <Show when={enabledModels()?.length} fallback={ 
                <>
                    <Settings />
                    <div class="flex justify-end py-4">
                        <SaveConfigsButton />
                    </div>
                </>
            } >
                <TextBoxes />
            </Show>
        </Show>
    )
}


