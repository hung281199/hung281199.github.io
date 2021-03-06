const socket = io('https://mycoturn.herokuapp.com/');

$('#div-chat').hide();

socket.on('DANH_SACH_ONLINE', arrUserInfo => {
    $('#div-chat').show();
    $('#div-dang-ky').hide();

    arrUserInfo.forEach(user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('CO_NGUOI_DUNG_MOI', user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('AI_DO_NGAT_KET_NOI', peerId => {
        $(`#${peerId}`).remove();
    });
});

socket.on('DANG_KY_THAT_BAT', () => alert('Vui long chon username khac!'));


function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

// openStream()
// .then(stream => playStream('localStream', stream));



const peer = new Peer({ 
    key: 'peerjs',
    host: 'sv-peer.herokuapp.com',
    secure: true,
    port: 443,
    config: {
        'iceServers': [
        // {
        //     'urls': 'stun:stun.services.mozilla.com'
        // }, {
        //     'urls': 'stun:stun.l.google.com:19302'
        // }, 
        {
            'urls': 'turn:turn-server.fi.ai:3478',
            'credential': '123',
            'username': 'hung'
        }]
    }
});

peer.on('open', id => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KY', { ten: username, peerId: id });
    });
});

//Caller
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

//Callee
peer.on('call', call => {
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => {
            var order = 1;
            let videoElement = `<video id="remoteStream${order}" width="300" controls></video>`
            $('#test').append(videoElement);
            playStream(`remoteStream${order}`, remoteStream);
        });
    });
});

var idUser = [];
$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    console.log(id);
    idUser.push(id);
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        var call = peer.call(id, stream);
        call.on('stream', remoteStream => {
            let videoElement = `<video id="remoteStream${id}" width="300" controls></video>`
            $('#test').append(videoElement);
            playStream(`remoteStream${id}`, remoteStream);
        });
    });
});
