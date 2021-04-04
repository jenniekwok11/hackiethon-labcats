const drawingInfo = {
    width: 800 ,
    height: 500,
    bgColor: "white",
  }
  const brushSizes = [1, 2, 3, 4, 5, 6, 7, 8, 10, 15, 150];
  const colors = "red,orange,yellow,green,cyan,blue,purple,white,gray,black".split(",");
  var currentColor = "black";
  var currentWidth = 2;
  var currentSelectBrush;
  var currentSelectColor;
  const colorSel = document.getElementById("colorSel");
  const brushSel = document.getElementById("brushSel");
  colors.forEach((color, i) => {
    var swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.backgroundColor = color;
    if (currentColor === color) {
      swatch.className = "swatch highlight";
      currentSelectColor = swatch;
    } else {
      swatch.className = "swatch";
    }
    swatch.addEventListener("click", (e) => {
      currentSelectColor.className = "swatch";
      currentColor = e.target.style.backgroundColor;
      currentSelectColor = e.target;
      currentSelectColor.className = "swatch highlight";
    });
    colorSel.appendChild(swatch);
  })
  brushSizes.forEach((brushSize, i) => { 
    var brush = document.createElement("canvas");
    brush.width = 16;
    brush.height = 16;
    brush.ctx = brush.getContext("2d");
    brush.ctx.beginPath();
    brush.ctx.arc(8, 8, brushSize / 2, 0, Math.PI * 2);
    brush.ctx.fill();
    brush.brushSize = brushSize;
    brush.className = "brush";
    if (currentWidth === brushSize) {
      brush.className = "swatch highlight";
      currentSelectBrush = brush;
    } else {
      brush.className = "swatch";
    }
  
    brush.addEventListener("click", (e) => {
      currentSelectBrush.className = "swatch";
      currentSelectBrush = e.target;
      currentSelectBrush.className = "swatch highlight";
      currentWidth = e.target.brushSize;
  
    });
    brushSel.appendChild(brush);
  })
  
  
  const canvas = document.getElementById("canvas-display");
  const mouse = createMouse().start(canvas, true);
  const ctx = canvas.getContext("2d");
  var updateDisplay = true; 
  var ch, cw, w, h; 
  
  
  var currentLine;
  
  var displayOffset = {
    x: 0,
    y: 0
  };
  
  const point = (x, y = x.y + ((x = x.x) * 0)) => ({
    x,
    y
  });
  function addPoint(x, y) {
    this.points.push(point(x, y));
  }
  
  function drawLine(ctx, offset) { 
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    var i = 0;
    while (i < this.points.length) {
      const p = this.points[i++];
      ctx.lineTo(p.x + offset.x, p.y + offset.y);
    }
    ctx.stroke();
  }
  
  function createLine(color, width) {
    return {
      points: [],
      color,
      width,
      add: addPoint,
      draw: drawLine,
    };
  }

  function createCanvas(width, height) {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    c.ctx = c.getContext("2d");
    return c;
  }
  function resizeCanvas() {
    ch = ((h = canvas.height = innerHeight - 32) / 2) | 0;
    cw = ((w = canvas.width = innerWidth) / 2) | 0;
    updateDisplay = true;
  }
  
  function createMouse() {
    function preventDefault(e) { e.preventDefault() }
    const mouse = {
      x: 0,
      y: 0,
      buttonRaw: 0,
      prevButton: 0
    };
    const bm = [1, 2, 4, 6, 5, 3]; 
    const mouseEvents = "mousemove,mousedown,mouseup".split(",");
    const m = mouse;
    function mouseMove(e) {
      m.bounds = m.element.getBoundingClientRect();
      m.x = e.pageX - m.bounds.left - scrollX;
      m.y = e.pageY - m.bounds.top - scrollY;
      
      if (e.type === "mousedown") {
        m.buttonRaw |= bm[e.which - 1];
      } else if (e.type === "mouseup") {
        m.buttonRaw &= bm[e.which + 2];
      }
      if (m.buttonRaw || m.buttonRaw !== m.prevButton) {
        updateDisplay = true;
      }
      if (m.buttonRaw !== 0 && m.prevButton === 0) { 
        currentLine = createLine(currentColor, currentWidth);
        currentLine.add(m); 
      } else if (m.buttonRaw !== 0 && m.prevButton !== 0) { 
        currentLine.add(m);     
      }
      m.prevButton = m.buttonRaw;
      e.preventDefault();
    }
    m.start = function(element, blockContextMenu) {
      m.element = element;
  
      mouseEvents.forEach(n => document.addEventListener(n, mouseMove));
      if (blockContextMenu === true) {
        document.addEventListener("contextmenu", preventDefault)
      }
      return m
    }
    return m;
  }
  var cursor = "crosshair";
  function update(timer) { 
    globalTime = timer;
    if (w !== innerWidth || h !== innerHeight) {
      resizeCanvas()
    }
    if (updateDisplay) {
      updateDisplay = false;
      display();
    }
   
    ctx.canvas.style.cursor = cursor;
    requestAnimationFrame(update);
  }
  const drawing = createCanvas(drawingInfo.width, drawingInfo.height);
  drawing.ctx.fillStyle = drawingInfo.bgColor;
  drawing.ctx.fillRect(0, 0, drawing.width, drawing.height);
  
  function display() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    const imgX = cw - (drawing.width / 2) | 0;
    const imgY = ch - (drawing.height / 2) | 0;
  
    ctx.strokeStyle = "black";
    ctx.lineWidth = "2";
    ctx.strokeRect(imgX, imgY, drawing.width, drawing.height);
    ctx.drawImage(drawing, imgX, imgY);
    if (mouse.buttonRaw !== 0) {
      if (currentLine !== undefined) {
        currentLine.draw(ctx, displayOffset); 
        cursor = "none";
        updateDisplay = true; 
      }
    } else if (mouse.buttonRaw === 0) {
      if (currentLine !== undefined) {
        currentLine.draw(drawing.ctx, {x: -imgX, y: -imgY }); 
        currentLine = undefined;
        updateDisplay = true;
        ctx.drawImage(drawing, imgX, imgY);
  
      }
    }
  }
  
  requestAnimationFrame(update);
  