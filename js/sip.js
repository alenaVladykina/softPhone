let ua = null;
let currentSession = null;


function stop() {
    return new Promise((resolve) => {
        ua.on('disconnected', () => resolve());
        ua.stop();
    });
}

export async function init({name, password, server, port}) {
    if (ua !== null) {
        await stop();
    }

    JsSIP.debug.enable('JsSIP:*');
    const socket = new JsSIP.WebSocketInterface(`wss://${server}`);

    // Настройка сокетов
    const portSeparator = port ? ':' : '';
    const config = {
        sockets: [socket],
        uri: `${name}@${server}${portSeparator}${port}`,
        password
    };

    ua = new JsSIP.UA(config);

    const remoteAudio = new window.Audio();
    remoteAudio.autoplay = true;

    ua.on('connected', () => {
        updateState({
            isConnected: true,
            connectionStatus: 'connected'
        });
    });
    ua.on('disconnected', () => {
        updateState({
            isConnected: false,
            connectionStatus: 'disconnected'
        });
    });
    ua.on('registered', function(e) {
        updateState({
            isRegistered: true,
            connectionStatus: 'registered'
        });
    });
    ua.on('unregistered', function(e) {
        updateState({
            isRegistered: false,
            connectionStatus: 'unregistered'
        });
    });
    ua.on('registrationFailed', function(e) {
        updateState({
            isRegistered: false,
            connectionStatus: 'registrationFailed'
        });
    });

    ua.on("newRTCSession", function (data) {
        const {session, originator} = data;
        currentSession = session;

        currentSession.on("accepted",function(){
            remoteAudio.srcObject = currentSession.connection.getRemoteStreams()[0];
        });

        currentSession.on('progress', () => {
            const phone = currentSession.remote_identity.uri.user;
            const type = originator === 'remote' ? 'incomingCall' : 'outgoingCall';

            updateStatus(type, {originator, phone});
        });

        currentSession.on('failed', () => {
            updateStatus('failed', {originator});
        });

        currentSession.on('ended', () => {
            updateStatus('ended', {originator});
        });

        currentSession.on('confirmed', () => {
            updateStatus('confirmed', {
                phone: currentSession.remote_identity.uri.user,
                originator
            });
        });
    });

    ua.start();
}


export function checkConfig({name, password, server, port} = {}) {
    return Boolean(name && password && server && port);
}

// Исходящий звонок
export function call(phone) {
    ua.call(phone, {
        mediaConstraints: {'audio': true, 'video': false}
    });
}

function updateState(payload) {
    console.log("updateState", payload)

    chrome.runtime.sendMessage({
        event: 'changeState',
        payload
    });
}

function updateStatus(value, {originator, phone} = {}) {
    chrome.runtime.sendMessage({
        event: 'changeStatus',
        payload: {
            value,
            date: new Date(),
            originator,
            phone
        }
    });
}

export function answer() {
    currentSession.answer({
        mediaConstraints: {'audio': true, 'video': false}
    });
}

// Отбой звонка
export function hangUp() {
    if (!currentSession.isEnded()) {
        currentSession.terminate();
    }
}
