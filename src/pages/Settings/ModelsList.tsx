import { For, createEffect } from "solid-js"
import { configs, save_config, setConfigs } from "../../global/configs"
import { enabledModels } from "../../global/text"
import Provider, { IModel, IProvider, TProviderNames } from "../../providers"



async function change_handler({provider, model}: { 
    provider: Partial<IProvider>, 
    model?: Partial<IModel>
} ) { //console.log(provider, model)

const provider_name = provider.provider_name as TProviderNames
const newConfigs = { ...configs() }
const addedModel = newConfigs.getM(provider.provider_name, model?.name)
const allowed_keys = ["name", "owned_by", "enabled", "index", "provider_name", "api_key"]
const providerEntry = newConfigs.providers[provider_name]


if(Object.keys(providerEntry ?? {})?.length) { 
    if (!provider.api_key) { 
        delete configs().providers[provider_name]
        return null

    } else if ( (addedModel?.enabled !== model?.enabled) && model && addedModel ) { 
        addedModel.enabled = model.enabled 
        if (!model.enabled) { delete model.index }
    }

} else if (provider.api_key && !providerEntry) { 
    newConfigs.providers[provider_name] = { ...Provider[provider_name] } as IProvider
    newConfigs.providers[provider_name].api_key = provider.api_key
    newConfigs.providers[provider_name].models = []

}


if (!addedModel && model && Object.keys(model ?? {})?.length) { 
    const newModel = Provider[provider_name]?.models?.find(m => m.name === model?.name)
    if(newModel) { 
        for (let [key, value] of Object.entries(model)) {
            if ( allowed_keys.includes(key) && (value!==undefined) ) { 
                newModel[key as keyof IModel] = value as never 
                newModel.index = enabledModels()?.length
            }
        }

        newConfigs.providers[provider_name]?.models?.push(newModel)
    }
}

setConfigs(newConfigs)
save_config(configs())

}


export default function ModelsList( {provider: provider_name}: {provider: string} ) { 
    let text_input: HTMLInputElement | undefined

    createEffect(() => { 
        const apiKey = configs()?.providers[provider_name as TProviderNames]?.api_key
        if (apiKey && text_input) { text_input.value = apiKey }
    })


    return ( 
        <>
            <div class="py-3 px-8 flex gap-4 items-center">
                <h1 class="font-bold text-xl">API KEY:</h1>
                <input type="text" placeholder="Insert key..." id={"input-"+provider_name} class="h-10 text-center rounded-xl bg-button"  
                ref={text_input} onInput={ (e) => change_handler( {
                    provider: {provider_name, api_key: e.currentTarget.value}
                } ) }/>
            </div>
            <For each={ Provider[provider_name as TProviderNames]?.models }>
                { (model: IModel) => <ModelItem providerName={provider_name} model={model} textInputRef={text_input} /> }
            </For>
        </>
    )
}




function ModelItem( {model, providerName: provider_name, textInputRef}: {model: IModel, providerName: string, textInputRef?: HTMLInputElement} ) { 
    let check_input: HTMLInputElement | undefined

    createEffect(() => { 
        if (configs().getM(provider_name, model.name)?.enabled && check_input) { check_input.checked = true }
    } )


    return(
        <li class="flex items-center gap-12 px-8 ">
            <div class="flex">
                <input type="checkbox" id={`${provider_name}-${model.name}`} class="mx-2" 
                 ref={check_input} onChange={ (e) => change_handler( { 
                        provider: {provider_name, api_key: textInputRef?.value},
                        model: {name: model.name, enabled: e.currentTarget.checked}

                } ) } />
                <p>{model.name}</p>
            </div>
        </li>
    )
}