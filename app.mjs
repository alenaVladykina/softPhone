import {Navigation} from "./js/navigation.js";
import {initNavigate} from "./js/initScript.js";


function updateNavigation(navigation, status) {
    switch (status) {
        case 'incomingCall':
        case 'outgoingCall':
        case 'confirmed':
            navigation.go('call');
            break;
        case 'init':
            initNavigate(navigation);
            break;
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

    const muteButton = document.querySelector('.js-mute');
    muteButton.addEventListener('click', (event) => {
        const isMute = event.target.classList.contains('call_button__mute');
        mute(isMute);
    });

    function mute(isMute) {
        muteButton.classList.toggle('call_button__mute', !isMute);
        muteButton.classList.toggle('call_button__unmute', isMute);
        chrome.runtime.sendMessage({event: isMute ? 'mute' : 'unmute'});
    }

    const answerButton = document.querySelector('.js-answer');
    answerButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({event: 'answer'});
    });

    chrome.storage.session.get(['status', 'connectionStatus']).then(({status, connectionStatus}) => {
        if (connectionStatus) {
            updateConnectionStatus(connectionStatus);
        }

        if (status) {
            updateNavigation(navigation, status);
            renderCall(status);
        }
    });


    chrome.storage.onChanged.addListener((changes, namespace) => {
        const {status, history, connectionStatus} = changes;
        if (connectionStatus) {
            updateConnectionStatus(connectionStatus.newValue);
        }

        if (status) {
            renderCall(status.newValue);
            updateNavigation(navigation, status.newValue);
        }

        history && renderHistory(history.newValue);
    });

    initConfigPage(navigation);

    function updateConnectionStatus(connectionStatus) {
        const elmConnectionStatusValue = document.querySelector('.js-connection-status-value');

        elmConnectionStatusValue.innerHTML = connectionStatus;

        const isRegistered = connectionStatus === 'registered';
        document.querySelector('.js-call').disabled = !isRegistered;
        historyList.classList.toggle('contact-list__disabled', !isRegistered);
    }

    const historyList = document.querySelector('.js-history');

    historyList.addEventListener("click",async (event) => {
        const phone = event.target?.dataset?.phone;

        if (phone && !historyList.classList.contains('contact-list__disabled')) {
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

    chrome.storage.local.get('history').then(({history}) => {
        renderHistory(history);
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
    }

    async function renderCall(status) {
        const isConfirmed = status === 'confirmed';
        const isIncomingCall = status === 'incomingCall';

        if (isConfirmed) {
            timerTik(timer);
        }

        mute(false);

        elmStatus.innerHTML = isIncomingCall
            ? 'Incoming call...'
            : 'Outgoing call...';

        const {phone} = await chrome.storage.session.get('phone')
        elmPhone.innerHTML = phone;

        elmStatus.classList.toggle('hidden', isConfirmed);
        timer.classList.toggle('hidden', !isConfirmed);
        answerButton.classList.toggle('hidden', !isIncomingCall);
        muteButton.classList.toggle('hidden', !isConfirmed);
    }
}

document.addEventListener("DOMContentLoaded", init);


async function initConfigPage(navigation) {
    const fields = document.querySelectorAll('.js-field');
    const {config: getConfig} = await chrome.storage.local.get("config");
    if (getConfig) {
        for (let field of fields) {
            field.value = getConfig[field.name];
        }
    }

    const configForm = document.querySelector('.form');

    configForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (event.submitter.name === "back") {
            navigation.go('main');
            return;
        }


        const formData = new FormData(configForm);
        const server = formData.get('server');
        const name = formData.get('name');
        const password = formData.get('password');
        const port = formData.get('port');
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
