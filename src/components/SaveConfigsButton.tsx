import { getEnabled } from "../global/configs";


export default function SaveConfigsButton() { 

    return( 
        <button class="p-4 px-10 text-xl rounded-xl bg-zinc-800 text-placeholder hover:bg-primary hover:text-white"
         onclick={getEnabled}>
            Save
        </button>
    )
}