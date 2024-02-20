function init() {

    const iframe = document.createElement("iframe");
    iframe.setAttribute("hidden", "hidden");
    iframe.setAttribute("id", "permissionsIFrame");
    iframe.setAttribute("allow", "microphone");
    iframe.src = chrome.runtime.getURL("requestPermissions.html");
    document.body.appendChild(iframe);


    function connect() {
        JsSIP.debug.enable('JsSIP:*');
        const socket = new JsSIP.WebSocketInterface('wss://voip.uiscom.ru');
        socket.via_transport = "wss";
        let session;

        const config = {
            sockets: [socket],
            // внутренний номер
            uri: 'sip:0332750@voip.uiscom.ru:9050',
            // пароль
            password: 'X_uzMT97X9'
        };

        const remoteAudio = new window.Audio();
        remoteAudio.autoplay = true;
        const ua = new JsSIP.UA(config);

        // События регистрации клиента
        ua.on('connected', function (e) {
            console.log('connected')
        });
        ua.on('disconnected', function (e) {
            console.log('disconnected')
        });
        ua.on('registered', function (e) {
            console.log('registered')
        });
        ua.on('unregistered', function (e) {
            console.log('unregistered')
        });
        ua.on('registrationFailed', function (e) {
            console.log('registrationFailed')
        });

        // Обработка событии исх. звонка
        const eventHandlers = {
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
        };

        const options = {
            'eventHandlers': eventHandlers,
            'mediaConstraints': {'audio': true, 'video': false}
        };

        // Запускаем
        ua.start();

        const buttonCall = document.getElementsByClassName('call')[0];
        const buttonStop = document.getElementsByClassName('stop')[0];

        // Кнопка для звонка
        buttonCall.addEventListener('click', function (event) {
            console.log("CALL > ", input.value);
            session = ua.call("sip:0332751@voip.uiscom.ru:9050", options);
        });

        // Кнопка для отбоя звонка
        buttonStop.addEventListener('click', function (event) {
            if (session) {
                session.terminate();
            }
        });
    }

    connect();

    //User Denied Media Access

    //navigator.mediaDevices.getUserMedia({audio: true, video:false});


    // function configFunction(sip, server, password) {
    //     const config = {
    //         sockets: [socket],
    //         uri: `${sip}${server}:${9050}`,
    //         password
    //     }
    //     return config
    // }

    chrome.storage.local.get("config").then((data) => {
        console.log(">", data);
    });


    //получаем данные из формы и записывем конфиг
    const configForm = document.querySelector('.form');

    configForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(configForm);
        const server = formData.get('server');
        const sip = formData.get('sip');
        const password = formData.get('password');
        const port = formData.get('port');

        // TODO valid

        const config = {server, password, sip, port};

        // TODO test connect

        chrome.storage.local.set({config});


    });


    //sip:0332751@voip.uiscom.ru:9050


// События регистрации клиента
    /* ua.on('connected', function (e) {
         console.log('connected')
     });
     ua.on('disconnected', function (e) {
         console.log('disconnected')
     });

     ua.on('registered', function (e) {
         console.log('registered')
     });
     ua.on('unregistered', function (e) {
         console.log('unregistered')
     });
     ua.on('registrationFailed', function (e) {
         console.log('registrationFailed')
     });*/

    // Обработка событии исх. звонка
    const eventHandlers = {
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
    };

    const options = {
        'eventHandlers': eventHandlers,
        'mediaConstraints': {'audio': true, 'video': false}
    };

    // Запускаем
    //ua.start();

    const input = document.getElementsByClassName('input')[0];
    const buttonCall = document.getElementsByClassName('call')[0];
    const buttonStop = document.getElementsByClassName('stop')[0];


    // Кнопка для звонка
    buttonCall.addEventListener('click', function (event) {

        console.log("CALL > ", input.value);
        // session = ua.call(input.value, options);
    });

    // Кнопка для отбоя звонка
    /* buttonStop.addEventListener('click', function (event) {
         if (session) {
             session.terminate();
         }
     });*/
}

document.addEventListener("DOMContentLoaded", init);


// const configuration = {
//     sockets: [socket],
//     // внутренний номер
//     uri: 'sip:0332750@voip.uiscom.ru:9050',
//     // пароль
//     password: 'X_uzMT97X9'
// };


/*
REGISTER sip:voip.uiscom.ru:9050 SIP/2.0
Via: SIP/2.0/WSS sb83vckjlt54.invalid;branch=z9hG4bK4018982
Max-Forwards: 69
To: <sip:0332750@voip.uiscom.ru:9050>
From: <sip:0332750@voip.uiscom.ru:9050>;tag=ncim0lsirg
Call-ID: 13svkc3n543locv44iqoqs
CSeq: 1 REGISTER
Contact: <sip:1jdjqe65@sb83vckjlt54.invalid;transport=wss>;+sip.ice;reg-id=1;+sip.instance="<urn:uuid:6ad9c67c-aa46-4b5b-acde-c98610ead9e0>";expires=600
Expires: 600
Allow: INVITE,ACK,CANCEL,BYE,UPDATE,MESSAGE,OPTIONS,REFER,INFO,NOTIFY
Supported: path,gruu,outbound
User-Agent: JsSIP 3.10.0
Content-Length: 0

 */

