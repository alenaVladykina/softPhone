import Navigation from "./js/navigation.js";
//import {init as init2, call as call2} from "./js/sip.js";


chrome.storage.local.get("config").then((dd) => {
    console.log("bbbb", dd);
})

//configure
//call
//connect


chrome.storage.session.get('isConnecting').then((e) => {
    console.log(e);
});


function init() {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("hidden", "hidden");
    iframe.setAttribute("id", "permissionsIFrame");
    iframe.setAttribute("allow", "microphone");
    iframe.src = chrome.runtime.getURL("requestPermissions.html");
    document.body.appendChild(iframe);

    chrome.runtime.sendMessage({
        type: '...',
        target: 'offscreen',
        data: '...'
    });

    // Init navigation
    const navigation = new Navigation(document.getElementById('app'));

    chrome.storage.session.get(["isConnecting", "isCall"]).then(({isConnecting, isCall}) => {
        if (isCall) {
            navigation.go('call');
        }
        console.log(isConnecting)
        //navigation.go(isConnecting ? 'main' : 'config');
        navigation.go('config');
    });


    async function connect() {
        const {config: configData} = await chrome.storage.local.get("config");
        const {userCall} = await chrome.storage.local.get("userCall");
        //получаем данные из стора
        JsSIP.debug.enable('JsSIP:*');
        const socket = new JsSIP.WebSocketInterface(`wss://voip.uiscom.ru`);


        //настройка сокетов
        const port = configData.port ? `:${configData.port}` : '';
        const config = {
            sockets: [socket],
            uri: `${configData.sip}@${configData.server}${port}`,//'sip:0332750@voip.uiscom.ru:9050',
            password: configData.password,
            //ws_servers: configData.url,
        };

        //настройка конфига
        const ua = new JsSIP.UA(config);

        const remoteAudio = new window.Audio();
        remoteAudio.autoplay = true;
        // коннект к учетке
        // ua.on('registered', function (e) {
        //     console.log(e)
        // });

        //  <sip:74950237857@10.0.0.68:5072;user=phone>;tag=S1syeeEKAABEE9DhCgAARBO6jMV_aQAq

        // 74950237857@voip.uiscom.ru:9050


        // События регистрации клиента
        // ua.on('connected', function (e) {
        //     chrome.storage.session.set({isConnecting: true});
        //     console.log('isConnecting', true)
        // });
        // ua.on('registrationFailed', function (e) {
        //     chrome.storage.session.set({isConnecting: false});
        //     console.log('isConnecting', false)
        // });
        //
        ua.on("newRTCSession", function (e) {
            console.log(e)
            // const uri = e.session.remote_identity.uri
            // console.log(JsSIP.URI.parse(uri))
            // let session = e.session;
            // let originator = e.originator
            // let options = e.request.options

        });


        // Обработка событии исх. звонка
        const eventHandlers = {
            'progress': function (data) {
                console.log('call is in progress', data);
                chrome.action.setBadgeText({text: 'c'})
                chrome.action.setBadgeBackgroundColor({color: '#008000'})

                // session.connection.ontrack = function (e) {
                //     console.log('progress');
                //     //remoteAudio.srcObject = e.streams[0];
                // };
            },
            'failed': function (data) {
                //chrome.storage.local.set({config});
                console.log('звонок не удался: ', data);
                //$('#call').css({'display': 'flex'});
                //$('#hangup').css({'display': 'none'});
                //звонок не удался
            },
            'ended': function (data) {
                console.dir('звонок завершился по причине: ', e);
                //звонок завершился по причине
                chrome.action.setBadgeText({text: 'c'})
                chrome.action.setBadgeBackgroundColor({color: '##FFFF00'})
                // $('#call').css({'display': 'flex'});
                // $('#hangup').css({'display': 'none'});
            },
            'confirmed': function (data) {
                console.log('звонок подтвержден', data);
                chrome.action.setBadgeText({text: 'c'})
                chrome.action.setBadgeBackgroundColor({color: '##FFFF00'})
            },
        };


        const options = {
            'eventHandlers': eventHandlers,
            //'extraHeaders': ['X-Foo: foo', 'X-Bar: bar'],
            'mediaConstraints': {'audio': true, 'video': false}
        };


        // Запускаем
        ua.start();
        //В случае звонка кому-либо
        userCall ? ua.call(userCall, options) : ''
    }


    //получаем данные из формы и записывем конфиг


    //sip:0332751@voip.uiscom.ru:9050


// События регистрации клиента
//      ua.on('connected', function (e) {
//          console.log('connected')
//      });
//      ua.on('disconnected', function (e) {
//          console.log('disconnected')
//      });

    // ua.on('registered', function (e) {
    //     console.log('registered')
    // });
    // ua.on('unregistered', function (e) {
    //     console.log('unregistered')
    // });
    // ua.on('registrationFailed', function (e) {
    //     console.log('registrationFailed')
    // });

    // Обработка событии исх. звонка
    /*const eventHandlers = {
        'progress': function (e) {
            console.log('call is in progress');

            session.connection.ontrack = function (e) {
                console.log(e);
                remoteAudio.srcObject = e.streams[0];
            };
        },
        'failed': function (e) {
            console.log('call failed with cause: ' + e.cause);
            //$('#call').css({'display': 'flex'});
            //$('#hangup').css({'display': 'none'});
        },
        'ended': function (e) {
            console.log('call ended with cause: ' + e.cause);
            // $('#call').css({'display': 'flex'});
            // $('#hangup').css({'display': 'none'});
        },
        'confirmed': function (e) {
            console.log('call confirmed');
            console.log(e);
        }
    };*/

    // const options = {
    //     'eventHandlers': eventHandlers,
    //     'mediaConstraints': {'audio': true, 'video': false}
    // };

    // Запускаем
    //ua.start();

    // const input = document.getElementsByClassName('input')[0];
    // const buttonCall = document.getElementsByClassName('call')[0];
    // const buttonStop = document.getElementsByClassName('stop')[0];


    // Кнопка для отбоя звонка
    // buttonStop.addEventListener('click', function (event) {
    //     if (session) {
    //         session.terminate();
    //     }
    // });


    const configForm = document.querySelector('.form');

    configForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(configForm);
        const server = formData.get('server');
        const name = formData.get('sip');
        const password = formData.get('password');
        const port = formData.get('port');
        const config = {server, password, name, port};
        chrome.storage.local.set({config});
        connect()
        //sip.connect();

    });

    const buttonCall = document.querySelector('.call_form')

    buttonCall.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(buttonCall);
        const userCall = formData.get('call');
        await chrome.storage.local.set({userCall});
        connect()


        /*event.preventDefault();
        const formData = new FormData(buttonCall);
        console.log(">>", formData.get('call'));
        chrome.storage.session.set({ isConnecting: formData.get('call') });*/

    })

    //connect();

}

document.addEventListener("DOMContentLoaded", init);


// ua.on("newRTCSession", function (data) {
//     const session = data.session;
//     const request = data.request;
//     const originator = data.originator;
//
//     console.debug("New session created");
//
//     if (session.direction === "incoming") {
//         // incoming call here
//         session.on("accepted", function () {
//             console.log('на звонок ответили')
//             // the call has answered
//         });
//         session.on("confirmed", function () {
//             // this handler will be called for incoming calls too
//             console.log('входящий вызовов')
//         });
//         session.on("ended", function () {
//             console.log('звонок завершился')
//             // the call has ended
//         });
//         session.on("failed", function () {
//             console.log('не могу установить звонок')
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


