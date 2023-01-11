// Socket.io chat room : https://antdev.tistory.com/33

let express = require('express');
let {createServer} = require('http');
const cors = require('cors');

let app = express();
const http = createServer(app);

const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

let connected = [];
let port = 3000;
let socketList = [];

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

let corsOptions = {
    origin: 'http://127.0.0.1:3000',
    credentials: true
}
app.use(cors(corsOptions));
let rooms = [];



app.use('/', function (req, res) {
    res.render(__dirname + '/views/main.ejs');
});


////연결이 성립되면
io.on('connection', (socket) => {
    socketList.push(socket);
    socket.emit('User count', io.engine.clientsCount);
    console.log('User Join');


    //연결이 성립됨과 동시에 채팅 앱 상에 웰컴 메세지를 띄운다.
    io.emit('announce', `${socket.id}님, 환영합니다. 접속해 있는 유저들에게 메세지를 보내보세요!`
    );
    //editing 상태일 경우 채팅창에 nickname이 입력중임을 나타내준다.
	socket.on('typing', function(nickname){
		if(nickname !== '') {
			socket.broadcast.emit('typing', nickname + ' is typing...');
		}
	});


    //Message Send 이벤트로 받아들이는 요청에 대한 처리
    socket.on('Message Send', function (msg, nickname) {
        socketList.forEach(function (item) {
            if (item != socket) {
                item.emit('Message Send', msg, nickname);
               
            }
        });
        socket.broadcast.emit('typing', '');
    });
    

    //연결이 끊기면
    //채팅 앱 상에는 디스커넥트 메세지를 띄운다.
    //연결이 끊김과 동시에 disconnected 됐다는 콘솔로그를 찍어준다.
    socket.on("disconnect", () => {
        console.log("user disconnected");
        io.emit('announce', ` ${socket.id}가 퇴장했습니다.`);
        // 나가는 사람을 제외한 나머지 유저에게만 메세지를 전송한다.
        connected = connected.filter(id => id !== socket.id);
    });

    socket.on('request_message', (msg) => {
        // response_message로 접속중인 모든 사용자에게 msg 를 담은 정보를 방출한다.
        io.emit('response_message', msg);
    });

    // 방참여 요청
    socket.on('req_join_room', async (msg) => {
        let roomName = 'Room_' + msg;
        if(!rooms.includes(roomName)) {
            rooms.push(roomName);
        }else{
            
        }
        socket.join(roomName);
        io.to(roomName).emit('noti_join_room', "방에 입장하였습니다.");
    });

    // 채팅방에 채팅 요청
    socket.on('req_room_message', async(msg) => {
        let userCurrentRoom = getUserCurrentRoom(socket);
        io.to(userCurrentRoom).emit('noti_room_message', msg);
        console.log(io.sockets.adapter.rooms);
    });

    socket.on('disconnect', async () => {
        console.log('user disconnected');
    });



    
    //서버의 모든 요청을 console.log로 띄운다. 디버그 전용
    socket.onAny((event, ...args) => {
        console.log(event, args);
    })


});

//현재 룸을 구하는 함수(여기서 작동을 안해서 현재 방을 못찾음)
// Room_1과같이 바로 써넣어버리면 작동 하는데,
//방을 만든 의미가 없으니 고쳐야함
function getUserCurrentRoom(socket){
    let currentRoom = '';
    let whereami = Array.from(socket.rooms)
        currentRoom = whereami
        console.log("나는 오디?",whereami)
    return currentRoom
}
http.listen(port, function () {
    console.log('Server On !');
});
