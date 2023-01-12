//이곳에 와야할 것 
//소켓과 관련된것들
// event handler / words.js
//게임 규칙에 관한것들은 여기에?


import { chooseWord } from "./words";

let sockets = [];
let inPrograss = false; //false 게임시작
let word = null;
let painter = null; // 출제자
let intervalStop = null; //setInterval 정지
let timeCount = 90; // 매 라운드 90초


  // 실시간 paint 시작좌표
  socket.on(events.beginPath, ({ x, y }) => {
    broadcast(events.beganPath, { x, y });
  });
  // 실시간 paint 그리기
  socket.on(events.strokePath, ({ x, y }) => {
    broadcast(events.strokedPath, { x, y });
  });
  // 실시간 color
  socket.on(events.getColor, ({ getColor }) => {
    broadcast(events.setColor, { color: getColor });
  });
  // 실시간 background color
  socket.on(events.getFillColor, ({ getColor }) => {
    broadcast(events.setFillColor, { color: getColor });
  });



  