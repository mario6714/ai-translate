import { configs, save_config, setConfigs } from "../../global/configs";



function change_handler(e: Event & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
} ) { 

    if (e.currentTarget.checked) { 
        configs().caching = e.currentTarget.checked
        setConfigs({ ...configs() })
        save_config(configs())
    }
}

export default function CachingToggle() { 

    return( 
        <div class="py-2 flex gap-3">
            <label class="cursor-pointer" for="caching-input">Caching: </label>
            <input type="checkbox" name="" id="caching-input" onChange={change_handler} checked={true} />
        </div>
    )
}