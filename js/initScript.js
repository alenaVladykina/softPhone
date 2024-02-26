import {checkConfig} from "./sip.js";

// import {createOffscreen} from "../service-worker.js"


export function initNavigate(navigation) {
    chrome.storage.local.get("config").then(({config}) => {
        if (checkConfig(config)) {
            navigation.go('main')
        } else {
            navigation.go('config')
        }
    })
}

export function createOffscreen() {
    return chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['WEB_RTC'],
        justification: 'for jsSip',
    });
}

export async function start(config) {
    if (checkConfig(config)) {
        await createOffscreen();
        chrome.runtime.sendMessage({
            event: 'init',
            payload: {config}
        })
    }
}


