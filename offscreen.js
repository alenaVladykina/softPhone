import {init, call, hangUp, answer} from "./js/sip.js";


chrome.runtime.onMessage.addListener(function ({event, payload}) {
    console.log("ggggggggggggggggggggggggggggggggggggg", event, payload)

    switch (event) {
        case "init":
            init(payload.config);
            break;
        case "call":
            call(payload.phone)
            break;
        case "hangUp":
            hangUp();
            break;
        case "answer":
            answer();
            break;
    }
});
