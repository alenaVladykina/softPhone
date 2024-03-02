import {checkConfig} from "./sip.js";


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

export async function setupOffscreenDocument(url) {
    const offscreenUrl = chrome.runtime.getURL(url);
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl]
    });

    return existingContexts.length > 0;
}

export async function start(config) {
    if (checkConfig(config)) {
        const offscreen = await setupOffscreenDocument('offscreen.html');
        if (!offscreen) {
            await createOffscreen();
        }

        chrome.runtime.sendMessage({
            event: 'init',
            payload: {config}
        });
    }
}
