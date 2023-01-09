// Socket.io chat room : https://antdev.tistory.com/33

var express = require('express');
var app = express();

var http = require('http');
var server = http.Server(app);

var socket = require('socket.io');
var io = socket(server);
let connected = [];
var port = 3000;
var socketList = [];

app.use('/', function (req, res) {
    res.sendFile(__dirname + '/views/chatroom.html');
});

////연결이 성립되면
io.on('connection', (socket) => {
    socketList.push(socket);

    console.log('User Join');
    //연결이 성립됨과 동시에 채팅 앱 상에는 웰컴 메세지를 띄운다.
    io.emit('announce', `${socket.id}님, 환영합니다. 접속해 있는 유저들에게 메세지를 보내보세요!`
    );
    //editing 상태일 경우 채팅창에 socket.id 가 입력중임을 나타내준다.
    socket.on('editing', () => {
        io.emit('editing', `${socket.id} 가 입력중입니다.`);
    })


    //SEND 이벤트로 받아들이는 요청에 대한 처리
    socket.on('Message Send', function (msg, nickname) {
        socketList.forEach(function (item, i) {
            if (item != socket) {
                item.emit('Message Send', msg, nickname);
            }
        });
    
    console.log("닉네임 아아", nickname)
    });
    
    //닉네임 설정
    socket.on('nickname', (name) => {

    })

    //연결이 끊기면
    //채팅 앱 상에는 디스커넥트 메세지를 띄운다.
    //연결이 끊김과 동시에 disconnected 됐다는 콘솔로그를 찍어준다.
    socket.on("disconnect", () => {
        console.log("user disconnected");
        io.emit('announce', ` ${socket.id}가 퇴장했습니다.`);
        // 나가는 사람을 제외한 나머지 유저에게만 메세지를 전송한다.
        connected = connected.filter(id => id !== socket.id);
        io.emit('online', connected);
    });

    //서버의 모든 요청을 console.log로 띄운다. 디버그 전용
    socket.onAny((event, ...args) => {
        console.log(event, args);
    })
});

server.listen(port, function () {
    console.log('Server On !');
});
