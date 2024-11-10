type SliderProps = { 
    tag: HTMLElement
}

export default function Slider({ tag }: SliderProps) { 

    return ( 
        <section class="w-full flex justify-around absolute bottom-0 bg-background">
            <button class="p-3" onclick={() => {
                tag?.scrollBy(-334, 0)
            }}>
                <svg class="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </button>
            <button class="p-3" onclick={() => {
                tag?.scrollBy(334, 0)
            }}>
                <svg class="size-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </section>
    )
}

