'use strict';
//엄격모드

(function() {
//익명함수 선언
//익명함수? 즉시 실행이 필요할 경우 사용하는 함수.
  var socket = io();
  //소켓 컨트롤을 위한 io()
  // This object holds the implementation of each drawing tool.
  var tools = {};
  //툴을 컨트롤하기위한 object 객체 선언
  var textarea;
  //text box를 사용하여 그릴때의 area 변수 지정
  var colorPicked;
  //jscolor 에서 color가 Picked되었을때, 컬러코드를 담을 변수 
  var lineWidthPicked;
  var SelectedFontFamily;
  //폰트 선택시 font지정 되었을때 그 폰트가 어떤것인지를 담을 변수
  var SelectedFontSize;
  //폰트 선택시 font size지정 되었을때 그 폰트의 size가 어떤것인지를 담을 변수
  
// Keep everything in anonymous function, called on window load.
// window 객체가 addEventListener일 경우
if(window.addEventListener) {
window.addEventListener('load', function () {
  var canvas, context, canvaso, contexto;
//window.addEventListener가 load 되면 
//canvas, context, canvaso, contexto 변수를 선언함

// addEventListener("load", (event) => {});
// onload = (event) => {};

  // The active tool instance.
  var tool;
  var tool_default = 'pencil';
  //현재 tool과, tool의 dafault는 연필그리기 모드.
  function init () {
    // Find the canvas element.
    // canvas 요소를 찾는다.
    canvaso = document.getElementById('imageView');
    if (!canvaso) {
      //찾지 못했을 경우의 예외처리.
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvaso.getContext) {
      //getContext메서드를 사용하여, 그리기 관련 함수들을 사용못할때의 예외처리
      alert('Error: no canvas.getContext!');
      return;
    }

    // Get the 2D canvas context.
    contexto = canvaso.getContext('2d');
    //역시 2d그리기 관련 함수들을 사용하지 못할때의 예외처리.
    if (!contexto) {
      alert('Error: failed to getContext!');
      return;
    }

    // Add the temporary canvas.
    //컨테이너 선언, canvanso를 parentNode로써 선언하고, 그 결과값을 container에 담는다.
    //parentElement와 parentNode의 차이?
    //parentElement는 부모노드가 없을때 null을 리턴하나
    //parentNode는 Document node를 리턴함
    //https://gafani.tistory.com/entry/javascript-%EB%B6%80%EB%AA%A8-%EC%97%98%EB%A6%AC%EB%A8%BC%ED%8A%B8%EB%85%B8%EB%93%9C
    var container = canvaso.parentNode;

    canvas = document.createElement('canvas');
    //canvas라는 Element를 생성한 후, canvas라는 변수에 담는다.
    //HTML 문서에서, Document.createElement() 메서드는 지정한 tagName의 HTML 요소를 만들어 반환.
    
    //canvas 못찾았을때에 대한 예외처리.
    if (!canvas) {
      alert('Error: I cannot create a new canvas element!');
      return;
    }

    canvas.id     = 'imageTemp';
    canvas.width  = canvaso.width;
    canvas.height = canvaso.height;
    container.appendChild(canvas);
    //canvas에 기본값에 대한 정의. 
    //(id는 imageTemp (그리는곳, 표시하는곳을 나눠놓음.))
    context = canvas.getContext('2d');
    //HTMLCanvasElement.getContext() 메소드는 캔버스의 드로잉 컨텍스트를 반환합니다. 
    //컨텍스트 식별자가 지원되지 않을 경우 null을 반환합니다.

    // Get the tool select input.
   // var tool_select = document.getElementById('dtool');
   //tool_select는 pencil-button라는 id속성을 사용해 태그에 접근하기 위해 선언함.
    var tool_select = document.getElementById('pencil-button');
   
    //tool_select.addEventListener('change', ev_tool_change, false);
    
    //Choose colour picker
    //color가 선택되었을때의 값을 colorPicked에 담아준다. default 0000000 (검은색)
    colorPicked = $("#colour-picker").val();
    
    //color가 변경되었을때 즉시 그 값을 colorPicked에 담아준다.
    $("#colour-picker").change(function(){
        colorPicked = $("#colour-picker").val();
    });
    
    //두께 지정
    //Choose line Width
    lineWidthPicked = $("#line-Width").val();
        
    //두께 값이 변경되었을경우 즉시 그 값을 lineWidthPicked에 담아준다.
    $("#line-Width").change(function(){
        lineWidthPicked = $("#line-Width").val();
    });
    
    //폰트 지정
    SelectedFontFamily = $("#draw-text-font-family").val();
    
    //폰트 지정 값이 변경되었을경우 바뀐 값을 즉시 SelectedFontFamily에 담아준다.
    $("#draw-text-font-family").change(function(){
        SelectedFontFamily = $("#draw-text-font-family").val();
    })
    
    //폰트 사이즈
    //SelectedFontSize
    SelectedFontSize = $("#draw-text-font-size").val();
    
    //폰트 사이즈 값이 변경되었을경우 바뀐 값을 즉시 SelectedFontSize에 담아준다.
    $("#draw-text-font-family").change(function(){
        SelectedFontSize = $("#draw-text-font-size").val();
    })
    

    // Activate the default tool.
    // 기본 tool을 활성화시키는 로직
    //tools 객체에 tool_default(pencil)이 있을경우
    //tool에는 tools[tool_default]()라는 객체타입의 인스턴스를 생성한다.
    //tool_select.value에는 
    //var tool_default = 'pencil'; 이 값을 담아준다.
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }
    
    //그리기 도구가 선택되었을경우의 함수
    //pick이라는 매개변수에 값이 들어왔을 경우
    //tool은 다시 그 값을 tools[pick.value]()라는 객체타입의 인스턴스를 생성한다.(붕어빵)
    function pic_tool_click(pick){
        if (tools[pick.value]) {
          tool = new tools[pick.value]();
        }
    }
    
    //그리기 도구가 클릭되었다면
    //pic_tool_click 함수에 this(매 함수의 this는 각 버튼의 값이다.)
    // 연필, 네모, 원, 타원, 선, 텍스트의 순서.
    $("#pencil-button").click(function(){
        pic_tool_click(this)
    });
    
    $("#rect-button").click(function(){
        pic_tool_click(this)
    });
    
     $("#circle-button").click(function(){
        pic_tool_click(this)
    });
    
    $("#ellipse-button").click(function(){
        pic_tool_click(this)
    });
    
    $("#line-button").click(function(){
        pic_tool_click(this)
    });
    
    $("#text-button").click(function(){
        pic_tool_click(this)
    });
    
    
    
    //이 함수 주석처리해도 잘 돌아감. 안쓰이는듯.
    //그리기 전, clearRect를 통해 초기화를 시켜줌.
    //추후 다시 주석 달아봄. 현재는 안쓰이니
    //Draw Grids
  function SketchGrid(gridSize) {
      context.clearRect(0, 0, canvas.width, canvas.height);  
        var w = canvas.width;
        var h = canvas.height;
        var gridWidth, gridColor;
        
       
       if(gridSize == "normal"){
           gridWidth = 25;
           gridColor = "#e7e8e8";
       }else if(gridSize == "medium"){
           gridWidth = 45;
           gridColor = "#e7e8e8";
       }else if(gridSize == "large"){
           gridWidth = 65;
           gridColor = "#e7e8e8";
       }else if(gridSize == "nogrid"){
           gridWidth = 25;
           gridColor = "#fff";  //no grid
       }

       /**
         * i is used for both x and y to draw
         * a line every 5 pixels starting at
         * .5 to offset the canvas edges
         */
         
        context.beginPath();  //important draw new everytime
        
        for(var i = .5; i < w || i < h; i += gridWidth) {
            // draw horizontal lines
            context.moveTo( i, 0 );
            context.lineTo( i, h);
            // draw vertical lines
            context.moveTo( 0, i );
            context.lineTo( w, i);
        }
        context.strokeStyle = gridColor;
        //contexto.strokeStyle = 'hsla(0, 0%, 40%, .5)';
        context.stroke();

    }
    
    
      // limit the number of events per second
      //1초에 그리기 요청을 얼마나 허용할것인지에 대한 함수
      //previousCall이라는 변수에 현재 시간을 담고,
      //현재 시간에서 previousCall을 뺀 값(0)이 delay보다 크거나 같을경우
      //callback라는 인자에는 null을, delay에는 arguments의 값을 리턴함? (뭘 리턴하는지 모르겠음 아직)
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
      //The arguments object
      //[apply]
      // 작성법 : fn.apply(thisArg, [argsArray])
      // this 인자를 첫번째 인자로 받고, 두번째 인자로는 배열을 받음
      
      if ((time - previousCall) >= delay) { 
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }


    //canvas위에서 마우스 왼쪽 버튼을 누를때(down), 뗄때(up), 마우스를 움직일때(move) 에 대한 eventlisteners 처리
    //
    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    //canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mousemove', throttle(ev_canvas, 10), false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.

  //위의 ev_canvas 함수에 대한 정의
  //CanvPos에는 canvas요소 크기와 Viewport에 상대적인 위치 정보를 제공하는 DOMRect 객체를 반환함.
  //DOMRect 인터페이스는 직사각형의 크기와 위치를 나타냅니다.
  //이를 통해 브라우저별 커서 위치에 대한 버그를 fix할수있음.
  function ev_canvas (ev) {
      //https://developer.mozilla.org/ko/docs/Web/API/Element/getBoundingClientRect
      //https://developer.mozilla.org/ko/docs/Web/API/DOMRect
      var CanvPos = canvas.getBoundingClientRect();  //Global Fix cursor position bug
    if (ev.clientX || ev.clientX == 0) { // Firefox
      //ev._x = ev.clientX;
      ev._x = ev.clientX - CanvPos.left;
     // ev._x = ev.layerX;
      //ev._y = ev.clientY;
      ev._y = ev.clientY - CanvPos.top;
      //ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      //ev._x = ev.offsetX;
      //ev._y = ev.offsetY;
    }
    
    // Call the event handler of the tool.

    //tool에 대한 event handler를 호출하는 변수.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
    //Hide textbox if not equals to text tool

    
  }
  // 이 함수를 선언함으로써 모든 tool들은 자유자재로 값을 바꾸더라도
  // 그 값을 온전히 가질수 있게 되었음.[맞나..?]
  // The event handler for any changes made to the tool selector.
  function ev_tool_change (ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
    }
  }
  
  
  // This function draws the #imageTemp canvas on top of #imageView, after which 
  // #imageTemp is cleared. This function is called each time when the user 
  // completes a drawing operation.
  //이 함수는 캔버스에 그려진 모든것들을 socket.io 통신으로
  //다른사람 캔버스에도 똑같이 그려주는 함수.
  //transferCanvas : true라는 값을 'copyCanvas'라고 서버와 약속한 socket 방[?]에
  //같이 보내준다.
  function img_update(trans) {
		contexto.drawImage(canvas, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
//        console.log(tool)
        if (!trans) { return; }

        socket.emit('copyCanvas', {
          transferCanvas: true
        });
  }

  //이 함수는 위 캔버스에서 무언가 그려졌을경우 
  //  socket.on('copyCanvas', onCanvasTransfer);
  // 이 값을 'copyCanvas'라고 서버와 약속해놓은 곳에 이 함수와 같이 전송한다.
    function onCanvasTransfer(data){
            img_update();
    }
  socket.on('copyCanvas', onCanvasTransfer);

  

  // The drawing pencil.

  //연필로 그릴때의 이미지처리에 대한 함수.
  //x0,y0은 moveTo할때 쓰는 좌표 (둘다 결과적으로 값은 같아야함.)
  //x1,y1은 lineTo할때 쓰는 좌표
  //moveTo는 경로를 어디서부터 시작할건지(마우스 따라가야하니 x0,y0로 쭉 따라감)
  //선을 긋는곳은 x0,y0와 같은곳이어야 하나 좌표 추적외에 점 찍는 위치를 정확하게 구분하려면
  //x,y 변수를 따로하나 선언해서 관리해주는것이 편해서 그런것 같음.
  //색상이 있다면 그 색으로 그려짐.
  //두께도 설정했다면 설정한 두께로 그려짐.
  //그리고 나면  closePath를 통해 
  //경로의 끝점과 경로의 시작점을 연결하는 직선을 추가하고 경로를 닫는다.
  //이 과정이 끝나면
  //socket.emit으로 각 그렸던 모든 좌표들을
  //각(x0,y0,x1,y1) 을 canvaso값 으로 나눈 값에 담고,
  //폰트 크기와, 선 굵기에 대한 정보도 같이 'drawing'이라는 통로에 담아 보냄
  function drawPencil(x0, y0, x1, y1, color, linewidth, emit){
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        if(color)
            context.strokeStyle = "#"+color;
        else
            context.strokeStyle = "#"+colorPicked; 
        if(linewidth)
            context.lineWidth = linewidth;
        else
            context.lineWidth = lineWidthPicked;
        context.stroke();
        context.closePath();

        if (!emit) { return; }
        var w = canvaso.width;
        var h = canvaso.height;

        socket.emit('drawing', {
          x0: x0 / w,
          y0: y0 / h,
          x1: x1 / w,
          y1: y1 / h,
          color: colorPicked,
          lineThickness: lineWidthPicked
        });
    }
    
    //위 함수를 직접적으로 Event Handling 해주는 함수.
    //w와 h에는 캔버스의 길이와 높이를 담아
    //drawPencil 함수에 위에 있었던 각 데이터들을 담아 socket통신을 한다.

    function onDrawingEvent(data){
        var w = canvaso.width;
        var h = canvaso.height;
        drawPencil(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineThickness);
    }
    
    socket.on('drawing', onDrawingEvent);
  
  //연필 그리기 시에 대한 처리들
  //선택만 했을때 값을 전부 초기화 시켜주고
  tools.pencil = function () {
    var tool = this;
    this.started = false;
    textarea.style.display = "none";
    textarea.style.value = "";
    
    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    // 마우스가 눌렸을때 started 를 true로, 툴의 x0,y0는 
    //현재 이벤트가 처리중인(연필 도구로 마우스를 누른 그 좌표들)좌표로 함.
    this.mousedown = function (ev) {
        //context.beginPath();
        //context.moveTo(ev._x, ev._y);
        tool.started = true; 
        tool.x0 = ev._x;
        tool.y0 = ev._y;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    //마우스가 움직일때에 대한 좌표 추적에 대한 함수.
    //언제든지 drawPencil에 현재 user가 x,y,색상,굵기에 대한 값들을 넣어
    //user가 원할때 원하는 위치에 원하는 색상 굵기로 draw할수 있게함.
    this.mousemove = function (ev) {
      if (tool.started) {
        drawPencil(tool.x0, tool.y0, ev._x, ev._y, colorPicked, lineWidthPicked, true);
        tool.x0 = ev._x;
        tool.y0 = ev._y;
      }
    };
    //마우스 버튼을 뗐을때에 대한 처리
    //마우스 버튼을 뗐을때 계속 그려지는것을 방지하기 위해?
    //tool이 활성화되었을경우에 
    // 그리기중임이 아님(false)으로 바꿔주고
    // 캔버스에는 지속적으로 업데이트를 받을수 있도록 해줌(다른사람이 그릴수도 있으니?)
    // 아래에 나온 각 그리기 도구의 로직이 비슷한 관계로 아래 도구는 스킵하겠음.
    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update(true);
      }
    };
  };
  
  //Rect
  function drawRect(min_x, min_y, abs_x, abs_y, color, linewidth, emit){
          
            context.clearRect(0, 0, canvas.width, canvas.height); 
        if(color)
            context.strokeStyle = "#"+color;
        else
            context.strokeStyle = "#"+colorPicked; 
        if(linewidth)
            context.lineWidth = linewidth;
        else
            context.lineWidth = lineWidthPicked;
            context.strokeRect(min_x, min_y, abs_x, abs_y);
            
            if (!emit) { return; }
            var w = canvaso.width;
            var h = canvaso.height;

            socket.emit('rectangle', {
              min_x: min_x / w,
              min_y: min_y / h,
              abs_x: abs_x / w,
              abs_y: abs_y / h,
              color: colorPicked,
              lineThickness: lineWidthPicked
            });
        
    }
    
    function onDrawRect(data){
        var w = canvaso.width;
        var h = canvaso.height;
        console.log("IN")
        drawRect(data.min_x * w, data.min_y * h, data.abs_x * w, data.abs_y * h, data.color, data.lineThickness);
    }
    
    socket.on('rectangle', onDrawRect);


  // The rectangle tool.
  tools.rect = function () {
    var tool = this;
    this.started = false;
    textarea.style.display = "none";
    textarea.style.value = "";
    
   //above the tool function

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var pos_x = Math.min(ev._x,  tool.x0),
          pos_y = Math.min(ev._y,  tool.y0),
          pos_w = Math.abs(ev._x - tool.x0),
          pos_h = Math.abs(ev._y - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height); //in drawRect

      if (!pos_w || !pos_h) {
        return;
      }
        //console.log("emitting")
      drawRect(pos_x, pos_y, pos_w, pos_h, colorPicked, lineWidthPicked, true);
      //context.strokeRect(x, y, w, h); // in drawRect
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update(true);
      }
    };
  };
  //Lines
   function drawLines(x0, y0, x1, y1, color, linewidth, emit){
          context.clearRect(0, 0, canvas.width, canvas.height); 
          context.beginPath();
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
          if(color)
            context.strokeStyle = "#"+color;
        else
            context.strokeStyle = "#"+colorPicked; 
         if(linewidth)
            context.lineWidth = linewidth;
        else
            context.lineWidth = lineWidthPicked;
          context.stroke();
          context.closePath();
          
            
            if (!emit) { return; }
            var w = canvaso.width;
            var h = canvaso.height;

            socket.emit('linedraw', {
              x0: x0 / w,
              y0: y0 / h,
              x1: x1 / w,
              y1: y1 / h,
              color: colorPicked,
              lineThickness: lineWidthPicked
            });
        
    }
    
    function onDrawLines(data){
        var w = canvaso.width;
        var h = canvaso.height;
        drawLines(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineThickness);
    }
    
    socket.on('linedraw', onDrawLines);


  // The line tool.
  tools.line = function () {
    var tool = this;
    this.started = false;
    textarea.style.display = "none";
    textarea.style.value = "";
    
    
    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }
        drawLines(tool.x0, tool.y0, ev._x, ev._y, colorPicked, lineWidthPicked, true);

    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update(true);
      }
    };
    
  };
  
  //The Circle tool
  
  //New Circle Function
  function drawCircle(x1, y1, x2, y2, color, linewidth, emit){
      
      context.clearRect(0, 0, canvas.width, canvas.height); 
 
    var x = (x2 + x1) / 2;
    var y = (y2 + y1) / 2;
 
    var radius = Math.max(
        Math.abs(x2 - x1),
        Math.abs(y2 - y1)
    ) / 2;
 
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI*2, false);
    // context.arc(x, y, 5, 0, Math.PI*2, false);
     context.closePath();
        if(color)
            context.strokeStyle = "#"+color;
        else
            context.strokeStyle = "#"+colorPicked; 
        if(linewidth)
            context.lineWidth = linewidth;
        else
            context.lineWidth = lineWidthPicked;  
            context.stroke();
        
            
            if (!emit) { return; }
            var w = canvaso.width;
            var h = canvaso.height;

            socket.emit('circledraw', {
              x1: x1 / w,
              y1: y1 / h,
              x2: x2 / w,
              y2: y2 / h,
              color: colorPicked,
              lineThickness: lineWidthPicked
            });
    
  }
  
   
    
    function onDrawCircle(data){
        var w = canvaso.width;
        var h = canvaso.height;
        drawCircle(data.x1 * w, data.y1 * h, data.x2 * w, data.y2 * h, data.color, data.lineThickness);
    }
    
    socket.on('circledraw', onDrawCircle);


  // The Circle tool.
  tools.circle = function () {
    var tool = this;
    this.started = false;
    textarea.style.display = "none";
    textarea.style.value = "";
    
    
    this.mousedown = function (ev) {
      tool.started = true;
      var rect = canvas.getBoundingClientRect();
      tool.x1 = ev.clientX - rect.left;
      tool.y1 = ev.clientY - rect.top;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }
      
      var rect = canvas.getBoundingClientRect();
        tool.x2 = ev.clientX - rect.left;
        tool.y2 = ev.clientY - rect.top;
    
        context.clearRect(0, 0, canvas.width, canvas.height); 
        drawCircle(tool.x1, tool.y1, tool.x2, tool.y2, colorPicked, lineWidthPicked, true);
        
        //context.strokeStyle = 'rgba(255, 0, 0, 0.5)'; //for old_drawCircle
        //context.strokeRect(x1, y1, x2-x1, y2-y1);

    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update(true);
      }
    };
    
  };
  
  //Ellipse Tool 
  

  function drawEllipse(x, y, w, h, color, linewidth, emit){
      
      context.clearRect(0, 0, canvas.width, canvas.height); 
    var ox, oy, xe, ye, xm, ym;
    var kappa = .5522848;
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle
 
      context.beginPath();
      context.moveTo(x, ym);
      context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
      context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
      context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
      context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
      context.closePath();
    
        if(color)
            context.strokeStyle = "#"+color;
        else
            context.strokeStyle = "#"+colorPicked; 
        if(linewidth)
            context.lineWidth = linewidth;
        else
            context.lineWidth = lineWidthPicked;  
            context.stroke();
        
            
            if (!emit) { return; }
            var canv_w = canvaso.width;
            var canv_h = canvaso.height;

            socket.emit('ellipsedraw', {
              x: x,
              y: y,
              w: w,
              h: h,
              color: colorPicked,
              lineThickness: lineWidthPicked
            });
    
  }
  
   
    
    function onDrawEllipse(data){
        var w = canvaso.width;
        var h = canvaso.height;
        drawEllipse(data.x, data.y, data.w, data.h, data.color, data.lineThickness);
    }
    
    socket.on('ellipsedraw', onDrawEllipse);


  // The Ellipse tool.
  tools.ellipse = function () {
    var tool = this;
    this.started = false;
    textarea.style.display = "none";
    textarea.style.value = "";
    
    
    this.mousedown = function (ev) {
      tool.started = true;
        tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }
      
        var x = Math.min(ev._x, tool.x0);
		var y = Math.min(ev._y, tool.y0);
		
		var w = Math.abs(ev._x - tool.x0);
		var h = Math.abs(ev._y - tool.y0);
      
        context.clearRect(0, 0, canvas.width, canvas.height); 
        drawEllipse(x, y, w, h, colorPicked, lineWidthPicked, true);

    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update(true);
      }
    };
    
  };
  
  
  
  
 //Text Tool start
 
textarea = document.createElement('textarea');
textarea.id = 'text_tool';
textarea.focus();
textarea.className += " form-control";
container.appendChild(textarea);

// Text tool's text container for calculating
// lines/chars
var tmp_txt_ctn = document.createElement('div');
tmp_txt_ctn.style.display = 'none';
container.appendChild(tmp_txt_ctn);


var onDrawTextBox = function(ev_x, ev_y, tool_x0, tool_y0) {
		
		 //context.clearRect(0, 0, canvas.width, canvas.height); 
      
        var x = Math.min(ev_x, tool_x0);
        var y = Math.min(ev_y, tool_y0);
        var width = Math.abs(ev_x - tool_x0);
        var height = Math.abs(ev_y - tool_y0);
         
        textarea.style.left = x + 'px';
        textarea.style.top = y + 'px';
        textarea.style.width = width + 'px';
        textarea.style.height = height + 'px';
         
        textarea.style.display = 'block';
	};
    
    
function DrawText(fsize, ffamily, colorVal, textPosLeft, textPosTop, processed_lines, emit){
        context.font = fsize + ' ' + ffamily;
        context.textBaseline = 'top';
        context.fillStyle = "#"+colorVal;
         
        for (var n = 0; n < processed_lines.length; n++) {
            var processed_line = processed_lines[n];
             
            context.fillText(
                processed_line,
                parseInt(textPosLeft),
                parseInt(textPosTop) + n*parseInt(fsize)
            );
        }
        
        img_update(); //Already emitting no need true param
        
        if (!emit) { return; }
            var w = canvaso.width;
            var h = canvaso.height;

            socket.emit('textdraw', {
              fsize: fsize,
              ffamily: ffamily,
              colorVal: colorVal,
              textPosLeft: textPosLeft,
              textPosTop: textPosTop,
              processed_linesArray: processed_lines 
            });
      
}

 function onTextDraw(data){
        var w = canvaso.width;
        var h = canvaso.height;
        DrawText(data.fsize, data.ffamily, data.colorVal, data.textPosLeft, data.textPosTop, data.processed_linesArray);
    }
    
    socket.on('textdraw', onTextDraw);
    


tools.text = function () {
    var tool = this;
    this.started = false;
    textarea.style.display = "none";
    textarea.style.value = "";
    
    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    
    };

    this.mousemove = function (ev) {
        if (!tool.started) {
        return;
      }
        
        var x = Math.min(ev._x, tool.x0);
        var y = Math.min(ev._y, tool.y0);
        var width = Math.abs(ev._x - tool.x0);
        var height = Math.abs(ev._y - tool.y0);
         
        textarea.style.left = x + 'px';
        textarea.style.top = y + 'px';
        textarea.style.width = width + 'px';
        textarea.style.height = height + 'px';
         
        textarea.style.display = 'block';
        textarea.style.color = "#"+colorPicked;
        textarea.style.font = SelectedFontSize+'px' + ' ' + SelectedFontFamily;
    };

    this.mouseup = function (ev) {
          if (tool.started) {
              
                //start      
                var lines = textarea.value.split('\n');
                var processed_lines = [];
                
                for (var i = 0; i < lines.length; i++) {
                    var chars = lines[i].length;
             
                        for (var j = 0; j < chars; j++) {
                            var text_node = document.createTextNode(lines[i][j]);
                            tmp_txt_ctn.appendChild(text_node);
                             
                            // Since tmp_txt_ctn is not taking any space
                            // in layout due to display: none, we gotta
                            // make it take some space, while keeping it
                            // hidden/invisible and then get dimensions
                            tmp_txt_ctn.style.position   = 'absolute';
                            tmp_txt_ctn.style.visibility = 'hidden';
                            tmp_txt_ctn.style.display    = 'block';
                             
                            var width = tmp_txt_ctn.offsetWidth;
                            var height = tmp_txt_ctn.offsetHeight;
                             
                            tmp_txt_ctn.style.position   = '';
                            tmp_txt_ctn.style.visibility = '';
                            tmp_txt_ctn.style.display    = 'none';
                             
                            // Logix
                             //console.log(width, parseInt(textarea.style.width));
                            if (width > parseInt(textarea.style.width)) {
                                break;
                            }
                        }
                     
                    processed_lines.push(tmp_txt_ctn.textContent);
                    tmp_txt_ctn.innerHTML = '';
                }
                
                /*var ta_comp_style = getComputedStyle(textarea);
                var fs = ta_comp_style.getPropertyValue('font-size');
                var ff = ta_comp_style.getPropertyValue('font-family');*/
                var fs = SelectedFontSize + "px";
                var ff = SelectedFontFamily;

                /*context.font = fs + ' ' + ff;
                context.textBaseline = 'top';
                context.fillStyle = "#"+colorPicked;
                 
                for (var n = 0; n < processed_lines.length; n++) {
                    var processed_line = processed_lines[n];
                     
                    context.fillText(
                        processed_line,
                        parseInt(textarea.style.left),
                        parseInt(textarea.style.top) + n*parseInt(fs)
                    );
                }
                
                img_update(); */
                
                DrawText(fs, ff, colorPicked, textarea.style.left, textarea.style.top, processed_lines, true)
                console.log("lines saved")
                textarea.style.display = 'none';
                textarea.value = '';
                          
            //end
                      
            tool.mousemove(ev);
            tool.started = false;
            
          }
    };
    
  };
  
  //Text tool end
  

//보드 지우기에 대한 함수.
//canvas 크기안에 있는 모든것들을 전부 초기화시키고
//초기화 시킨뒤의 캔버스 값들을 socket.emit을 통해 CleardrawingBoard는 true라는 값과 함께 전송함
//

  function clearAll_update(trans) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    contexto.clearRect(0, 0, canvaso.width, canvaso.height);
      
        if (!trans) { return; }

        socket.emit('Clearboard', {
          CleardrawingBoard: true
        });
  }
  
   function onClearAll(data){
            clearAll_update();
    }
  
    //위 과정을 다른 사용자도 같이 지워진 캔버스 값을 받을수 있도록
    //동시에 Clearboard라는 요청을 받은 모든 사용자의 캔버스를 초기화시킨다.
  socket.on('Clearboard', onClearAll);

  
$("#clear-all").click(function(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    contexto.clearRect(0, 0, canvaso.width, canvaso.height);
    clearAll_update(true)
});


  init();
  
    

}, false); }



//end


})();


