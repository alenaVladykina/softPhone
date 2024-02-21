import {checkConfig} from "./js/sip.js";


chrome.storage.local.get("config").then(async ({config}) => {
    if (checkConfig(config)) {
        await createOffscreen();

        chrome.runtime.sendMessage({
            event: 'init',
            payload: { config },
        });
    }
});

function createOffscreen() {
    return chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['WEB_RTC'],
        justification: 'for jsSip',
    });
}
