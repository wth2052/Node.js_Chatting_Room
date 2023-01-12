const canvas = document.getElementById("jsCanvas")
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 650;
let painting = false;

function stopPainting() {
  ctx.closePath();
  painting = false;
  console.log("stop?", painting)
}
function startPainting() {
  painting = true;
  console.log("start?", painting);
}
function onMouseMove(event) {
  const x = event.offsetX;
  const y = event.offsetY;
  console.log("event", event)
  console.log("painting?", painting)
  if(!painting) {
  ctx.beginPath();
} else {
  ctx.lineTo(x,y);
  ctx.stroke();
}
}
//오른쪽 마우스 클릭 막기
function handleRightClick(event) {
    event.preventDefault();
  }

if (canvas) {
  canvas.addEventListener("mousemove", onMouseMove); //마우스 움직일때
  canvas.addEventListener("mousedown", startPainting); //마우스 버튼 누를때
  canvas.addEventListener("mouseup", stopPainting); //마우스 버튼 뗐을대
  canvas.addEventListener("mouseleave", stopPainting) // 마우스 캔버스 이탈시
}

// export const handleBeganPath = ({ x, y }) => beginPath(x, y);
// export const handleStrokedPath = ({ x, y }) => strokedPath(x, y);
// export const handleSetColor = ({ color }) => socketSetColor(color);
// export const handleSetFillColor = ({ color }) => socketSetFillColor(color);



const enableCanvas = () => {
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', startPainting);
    canvas.addEventListener('mouseup', stopPainting);
    canvas.addEventListener('mouseleave', stopPainting);
    canvas.addEventListener('contextmenu', handleRightClick);
  };
const disableCanvas = () => {
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mousedown', startPainting);
    canvas.removeEventListener('mouseup', stopPainting);
    canvas.removeEventListener('mouseleave', stopPainting);
    canvas.removeEventListener('contextmenu', handleRightClick);
  };
