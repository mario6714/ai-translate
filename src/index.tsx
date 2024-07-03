/* @refresh reload */
import { createEffect } from 'solid-js'
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router'
import { get_config, setConfigs } from './global/configs'
import { getEnabled } from './global/text'
import App from './pages/App'
import Settings from './pages/Settings'



function Root()  { 
    createEffect(async() => { console.log('hello from "app" p/')
        const result = await get_config()
        if (result) { setConfigs(result) }
        getEnabled()
    } )

    return (
        <Router>
            <Route path="/" component={App} />
            <Route path="/settings" component={Settings} />
        </Router>
    )
}

const root = document.getElementById('root')

render(() => <Root />, root!)
