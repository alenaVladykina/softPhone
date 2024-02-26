let ua = null;
let currentSession = null;


export function init({name, password, server, port}) {
    if (ua !== null) {
        return;
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

    ua.on("newRTCSession", function (data) {
        const {session, request, originator} = data;
        currentSession = session;

        currentSession.on('progress', () => {
            const phone = currentSession.remote_identity.uri.user;

            if (originator === 'remote') {
                updateStatus('incomingCall', {originator, phone});
            } else {
                updateStatus('outgoingCall', {originator, phone});
                currentSession.connection.ontrack = function (e) {
                    remoteAudio.srcObject = e.streams[0];
                };
            }
        });

        currentSession.on('failed', (e) => {
            updateStatus('failed', {originator});
        });

        currentSession.on('ended', (e) => {
            updateStatus('ended', {originator});
        });

        currentSession.on('confirmed', () => {
            updateStatus('confirmed', {
                phone: currentSession.remote_identity.uri.user,
                originator
            });
        });
    })

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
    currentSession.terminate();
}
