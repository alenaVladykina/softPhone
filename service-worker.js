import {checkConfig} from "./js/sip.js";

chrome.storage.session.set({status: 'init'});
chrome.action.setBadgeBackgroundColor({color: '#fff'});

chrome.storage.local.get(["config"]).then(async ({config}) => {
    if (checkConfig(config)) {
        await createOffscreen();

        chrome.runtime.sendMessage({
            event: 'init',
            payload: {config},
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

chrome.runtime.onMessage.addListener(function ({event, payload}) {
    if (event === 'changeStatus') {
        const {value, date, phone, originator} = payload;

        chrome.storage.session.set({
            status: value,
            date,
            phone,
            originator
        });
    }
});


// Update history
chrome.storage.onChanged.addListener(async ({date, status}, namespace) => {
    if (namespace !== "session") {
        return;
    }

    const newStatus = status.newValue;

    if (newStatus === "incomingCall" || newStatus === "outgoingCall") {
        const badge = newStatus === "incomingCall" ? "🔴" : "🟢";
        chrome.action.setBadgeText({text: badge});
    }

    if (newStatus === "ended" || newStatus === "failed") {
        chrome.action.setBadgeText({text: ""});

        let {history} = await chrome.storage.local.get("history");
        let {phone, originator} = await chrome.storage.session.get(["originator", "phone"]);

        if (!Array.isArray(history)) {
            history = [];
        }

        let duration = 0;

        if (status.oldValue === "confirmed") {
            const startTime = new Date(date.oldValue).getTime();
            const endTime = new Date(date.newValue).getTime();
            duration = endTime - startTime;
        }

        history.unshift({
            phone,
            status: newStatus,
            date: date.newValue,
            duration,
            originator
        });

        chrome.storage.local.set({history})
    }
});