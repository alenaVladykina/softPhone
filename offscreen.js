import {init} from "./js/sip.js";


chrome.runtime.onMessage.addListener(function ({event, payload}) {
    if (event === "init") {
        init(payload.config);
    }
});
