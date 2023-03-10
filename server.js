// Socket.io chat room : https://antdev.tistory.com/33

let express = require('express');
let {createServer} = require('http');
const cors = require('cors');
let app = express();
const http = createServer(app);
app.use(express.static('assets'));
const { instrument } = require("@socket.io/admin-ui");
const io = require('socket.io')(http, {
    cors: {
        origin: ["https://admin.socket.io", "http://127.0.0.1"],
        methods: ["GET", "POST"],
        credentials: true
    },
});


instrument(io, {
    auth: false,
    mode: "development",
  });
let connected = [];
let port = 3000;
let socketList = [];
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

let corsOptions = {
    origin: 'http://127.0.0.1:3000',
    credentials: true
}
app.use(cors(corsOptions));
let rooms = [];



app.use('/', function (req, res) {
    res.render(__dirname + '/public/main.ejs');
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
        io.to(roomName).emit('noti_join_room', `${roomName}에 입장하였습니다.`);
        socket.emit('Room User count', io.engine.clientsCount);
    });

    socket.on('req_leave_room', async(msg) => {
        let userCurrentRoom = getUserCurrentRoom(socket);
        console.log(userCurrentRoom)
        socket.leave(userCurrentRoom);
        io.to(userCurrentRoom).emit('noti_leave_room', `접속 id:${socket.id} 상대방이 방에서 퇴장하였습니다.`, msg)
        
    })


    // 채팅방에 채팅 요청
    socket.on('req_room_message', async(msg) => {
        let userCurrentRoom = getUserCurrentRoom(socket);
        io.to(userCurrentRoom).emit('noti_room_message', msg);

    });


    //연필로 그리기
    socket.on('drawing', function(data){
        socket.broadcast.emit('drawing', data);
        console.log(data);
      });
      
      socket.on('rectangle', function(data){
        socket.broadcast.emit('rectangle', data);
        console.log(data);
      });
      

      //선 그리기
      socket.on('linedraw', function(data){
        socket.broadcast.emit('linedraw', data);
        console.log(data);
      });
      //원 그리기
       socket.on('circledraw', function(data){
        socket.broadcast.emit('circledraw', data);
        console.log(data);
      });
      //타원 그리기
      socket.on('ellipsedraw', function(data){
        socket.broadcast.emit('ellipsedraw', data);
        console.log(data);
      });
      //텍스트 쓰기
      socket.on('textdraw', function(data){
        socket.broadcast.emit('textdraw', data);
        console.log(data);
      });
      //나도 몰루? 인도형 뭘만들었누?
      socket.on('copyCanvas', function(data){
        socket.broadcast.emit('copyCanvas', data);
        console.log(data);
      });
      //보드 지우기
      socket.on('Clearboard', function(data){
        socket.broadcast.emit('Clearboard', data);
        console.log(data);
      });

    //서버의 모든 요청을 console.log로 띄운다. 디버그 전용
    socket.onAny((event, ...args) => {
        console.log(event, args);
    })

});
    

function getUserCurrentRoom(socket){
    let currentRoom = '';
    let socketRooms = Array.from(socket.rooms)
    for( let i = 0 ; i < socketRooms.length; i ++ ){
        if(socketRooms[i].indexOf('Room_') !== -1){
            currentRoom = socketRooms[i];
            break;
        } 
    }
    console.log("히히 나는 지금 오디?",currentRoom)
    return currentRoom;

    
}
function countRoom(roomName){
    return io.sockets.adapter.rooms.get(roomName)?.size;
    
}

http.listen(port, function () {
    console.log('Server On !');
});
