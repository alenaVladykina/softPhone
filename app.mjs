import {Navigation} from "./js/navigation.js";

function updateNavigation(navigation, status) {
    switch (status) {
        case 'incomingCall':
        case 'outgoingCall':
        case 'confirmed':
            navigation.go('call');
            break;
        case 'init':
        case 'ended':
        case 'failed':
            navigation.go('main');
            break;
    }
}

function formatTime(time) {
    const timeInSeconds = Math.ceil(time / 1000);
    const hours = Math.floor(timeInSeconds / 60 / 60);
    const minutes = Math.floor(timeInSeconds / 60) - (hours * 60);
    const seconds = timeInSeconds % 60;
    const result = [];

    if (hours > 0) {
        result.push(hours.toString().padStart(2, '0'));
    }

    result.push(
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    );

    return result.join(':');
}

async function timerTik(element) {
    const {date, status} = await chrome.storage.session.get(['date', 'status']);
    const startTime = new Date(date).getTime();
    const currentTime = new Date().getTime();
    const time = currentTime - startTime;

    element.innerText = formatTime(time);

    if (status === 'confirmed') {
        setTimeout(timerTik, 1000, element);
    }
}

function init() {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("hidden", "hidden");
    iframe.setAttribute("id", "permissionsIFrame");
    iframe.setAttribute("allow", "microphone");
    iframe.src = chrome.runtime.getURL("requestPermissions.html");
    document.body.appendChild(iframe);

    // Init navigation
    const navigation = new Navigation(document.getElementById('app'));
    const timer = document.querySelector('.js-timer');
    const elmStatus = document.querySelector('.js-status');
    const elmPhone = document.querySelector('.js-phone');

    const buttonSettings = document.querySelector('.contacts_settings');
    buttonSettings.addEventListener('click', async (event) => {
        navigation.go('config');
    });

    const hangUpButton = document.querySelector('.js-hang-up');
    hangUpButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({event: 'hangUp'});
    });

    const answerButton = document.querySelector('.js-answer');
    answerButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({event: 'answer'});
    });

    chrome.storage.session.get('status').then(({status}) => {
        updateNavigation(navigation, status);
    });


    chrome.storage.onChanged.addListener((changes, namespace) => {
        const {status, history} = changes;

        status && renderCall(status.newValue);
        history && renderHistory(history.newValue);
    });

    initConfigPage(navigation);

    const historyList = document.querySelector('.js-history');

    chrome.storage.local.get(['status', 'history']).then(({status, history}) => {
        renderHistory(history);
        renderCall(status);
    });

    function renderHistory(history) {
        if (!history || history.length < 1) {
            return;
        }

        const dateTimeOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timezone: 'UTC',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        };

        let items = `
            <li class="contact-list_item contact-list_item__header">
                <div class="contact-list_value contact-list_value__status"></div>
                <div class="contact-list_value contact-list_value__phone">Numder</div>
                <div class="contact-list_value contact-list_value__date">Date</div>
                <div class="contact-list_value contact-list_value__duration">Duration</div>
            </li>
        `;
        history.forEach(({phone, date, duration, status, originator}) => {
            const statusList = ['contact-list_status'];

            if (status === "failed") {
                statusList.push("contact-list_status__fail");
            }

            statusList.push(originator === "local" ? "contact-list_status__made" : "contact-list_status__received");

            items += `
                <li class="contact-list_item">
                    <div class="contact-list_value contact-list_value__status">
                        <div class="${statusList.join(' ')}"></div>
                    </div>
                    <div class="contact-list_value contact-list_value__phone">${phone}</div>
                    <div class="contact-list_value contact-list_value__date">${new Date(date).toLocaleString("ru", dateTimeOptions)}</div>
                    <div class="contact-list_value contact-list_value__duration">${duration ? formatTime(duration) : ""}</div>
                    <div class="contact-list_action"><button class="contact-list_call js-history-call" data-phone="${phone}">Call</button></div>
                </li>
            `;
        });

        historyList.innerHTML = items;

        historyList.addEventListener("click", async (event) => {
            const phone = event.target?.dataset?.phone;

            if (phone) {
                const {config} = await chrome.storage.local.get("config");
                const {port, server} = config;
                const portSeparator = port ? ':' : '';

                chrome.runtime.sendMessage({
                    event: 'call',
                    payload: {
                        phone: `${phone}@${server}${portSeparator}${port}`
                    }
                });
            }
        })
    }

    async function renderCall(status) {
        const isConfirmed = status === 'confirmed';
        const isIncomingCall = status === 'incomingCall';

        if (isConfirmed) {
            timerTik(timer);
        }

        elmStatus.innerHTML = isIncomingCall
            ? 'Incoming call...'
            : 'Outgoing call...';

        const {phone} = await chrome.storage.session.get('phone')
        elmPhone.innerHTML = phone;

        elmStatus.classList.toggle('hidden', isConfirmed);
        timer.classList.toggle('hidden', !isConfirmed);
        answerButton.classList.toggle('hidden', !isIncomingCall);

        updateNavigation(navigation, status);
    }
}

document.addEventListener("DOMContentLoaded", init);

async function initConfigPage(navigation) {
    const fields = document.querySelectorAll('.js-field');
    const {config} = await chrome.storage.local.get("config")
    for (let field of fields) {
        const name = field.name;
        field.value = config[name]
    }

    console.log(config)

    const configForm = document.querySelector('.form');
    configForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (event.submitter.name === "back") {
            navigation.go('main');
            return
        }

        const formData = new FormData(configForm);
        const server = formData.get('server').trim();
        const name = formData.get('name').trim();
        const password = formData.get('password').trim();
        const port = formData.get('port').trim();
        const config = {server, password, name, port};
        chrome.storage.local.set({config});
        navigation.go('main');
    });
}


const buttonCall = document.querySelector('.call-form');

buttonCall.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(buttonCall);
    let phone = formData.get('call');

    if (!phone) {
        return;
    }

    chrome.runtime.sendMessage({
        event: 'call',
        payload: {phone}
    });
});
