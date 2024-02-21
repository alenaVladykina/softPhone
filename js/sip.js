let ua = null;

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
    ua.start();
}

export function checkConfig({name, password, server, port} = {}) {
    return Boolean(name && password && server && port); // TODO улучшить валидацию, например проверять на порт на число
}

export function call() {

}

export function answer() {

}

export function hangUp() {

}


// export default class Sip {
//     ua;
//
//     constructor() {
//         console.log(this.ua)
//     }
//
//     async connect() {
//         const {config: configData} = await chrome.storage.local.get("config");
//         const {userCall} = await chrome.storage.local.get("userCall");
//         //получаем данные из стора
//         const socket = new JsSIP.WebSocketInterface(`wss://voip.uiscom.ru`);
//
//         //настройка сокетов
//         const port = configData.port ? `:${configData.port}` : '';
//         const config = {
//             sockets: [socket],
//             uri: `${configData.sip}@${configData.server}${port}`,//'sip:0332750@voip.uiscom.ru:9050',
//             password: configData.password
//         };
//
//         const remoteAudio = new window.Audio();
//         remoteAudio.autoplay = true;
//         const ua = new JsSIP.UA(config);
//         ua.start()
//         JsSIP.UA.get(ua)
//     }
//
//     async call() {
//
//         const {userCall} = await chrome.storage.local.get("userCall");
//
//         console.log(userCall)
//         const eventHandlers = {
//             'progress': function (data) {
//                 console.log('call is in progress', data);
//                 chrome.action.setBadgeText({text: 'c'})
//                 chrome.action.setBadgeBackgroundColor({color: '#008000'})
//
//                 // session.connection.ontrack = function (e) {
//                 //     console.log('progress');
//                 //     //remoteAudio.srcObject = e.streams[0];
//                 // };
//             },
//             'failed': function (data) {
//                 //chrome.storage.local.set({config});
//                 console.log('звонок не удался: ', data);
//                 //$('#call').css({'display': 'flex'});
//                 //$('#hangup').css({'display': 'none'});
//                 //звонок не удался
//             },
//             'ended': function (data) {
//                 console.dir('звонок завершился по причине: ', e);
//                 //звонок завершился по причине
//                 chrome.action.setBadgeText({text: 'c'})
//                 chrome.action.setBadgeBackgroundColor({color: '##FFFF00'})
//                 // $('#call').css({'display': 'flex'});
//                 // $('#hangup').css({'display': 'none'});
//             },
//             'confirmed': function (data) {
//                 console.log('звонок подтвержден', data);
//                 chrome.action.setBadgeText({text: 'c'})
//                 chrome.action.setBadgeBackgroundColor({color: '##FFFF00'})
//             },
//         };
//         const options = {
//             'eventHandlers': eventHandlers,
//             //'extraHeaders': ['X-Foo: foo', 'X-Bar: bar'],
//             'mediaConstraints': {'audio': true, 'video': false}
//         };
//         console.log(this.ua)
//         //this.ua.call(userCall, options)
//     }
// }


// События регистрации клиента
// ua.on('connected', function (e) {
//     console.log('connected')
// });
// ua.on('registrationFailed', function (e) {
//     console.log('registrationFailed')
// });
//
// ua.on('sipEvent', function (e) {
//     console.log("sipEvent", e);
// });
//
// ua.on("newRTCSession", function (data) {
//     var session = data.session;
//
//     console.log("newRTCSession", session.direction, data);
//
//     if (session.direction === "incoming") {
//         // incoming call here
//         session.on("accepted", function () {
//             // the call has answered
//         });
//         session.on("confirmed", function () {
//             // this handler will be called for incoming calls too
//         });
//         session.on("ended", function () {
//             // the call has ended
//         });
//         session.on("failed", function () {
//             // unable to establish the call
//         });
//         session.on('addstream', function (e) {
//             // set remote audio stream (to listen to remote audio)
//             // remoteAudio is <audio> element on page
//             remoteAudio.src = window.URL.createObjectURL(e.stream);
//             remoteAudio.play();
//         });
//
//         var callOptions = {
//             mediaConstraints: {
//                 audio: true, // only audio calls
//                 video: false
//             }
//         };
//
//         // Answer call
//         session.answer(callOptions);
//
//         // Reject call (or hang up it)
//         //session.terminate();
//     }
// });
//
// ua.on('disconnected', function (e) {
// });
// ua.on('registered', function (e) {
// });
// ua.on('unregistered', function (e) {
// });
//
// // Обработка событии исх. звонка
// const eventHandlers = {
//     'progress': function (e) {
//         console.log('call is in progress', e);
//
//         session.connection.ontrack = function (e) {
//             console.log('progress');
//             remoteAudio.srcObject = e.streams[0];
//         };
//     },
//     'failed': function (e) {
//         //chrome.storage.local.set({config});
//         console.log('звонок не удался: ', e);
//         //$('#call').css({'display': 'flex'});
//         //$('#hangup').css({'display': 'none'});
//         //звонок не удался
//     },
//     'ended': function (e) {
//         console.dir('звонок завершился по причине: ', e);
//         //звонок завершился по причине
//         // $('#call').css({'display': 'flex'});
//         // $('#hangup').css({'display': 'none'});
//     },
//     'confirmed': function (e) {
//         console.log('звонок подтвержден', e);
//         //звонок подтвержден
//     }
// };
//
//
// const options = {
//     'eventHandlers': eventHandlers,
//     'mediaConstraints': {'audio': true, 'video': false}
// };
//
// // Запускаем
// ua.start();
// //В случае звонка кому-либо
// userCall ? ua.call(userCall, options) : ''
// }