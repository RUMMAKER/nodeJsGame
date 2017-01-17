var canvas,			// Canvas DOM element
	nameField,		// Input DOM element
	ctx,			// Canvas rendering context
	players,		// Array of all players
	bullets,		// Array of all bullets
	mousePos,		// Current mousePosition, relative to canvas
	ownId,			// Used to identify when ur own player died
	socket;			// Socket connection

function init() {
	// Declare the canvas and rendering context
	var bgCanvas = document.getElementById("gameBg");
	canvas = document.getElementById("gameCanvas");
	nameField = document.getElementById("playerNameField");
	ctx = canvas.getContext("2d");
	ctx.font="bold 25px Arial";

	// Maximise the canvas
	//canvas.width = window.innerWidth;
	//canvas.height = window.innerHeight;
	canvas.width = WIDTH;
	canvas.height = HEIGHT;

	bgCanvas.width = WIDTH;
	bgCanvas.height = HEIGHT;
	bgCanvas.style.top = "0px"
	bgCanvas.style.left = "0px"
	drawBg(bgCanvas);

	// Center nameField
	//nameField.style.top = (window.innerHeight/2-30)+"px";
	//nameField.style.left = (window.innerWidth/2-120)+"px";
	nameField.style.top = (canvas.height/2-30)+"px";
	nameField.style.left = (canvas.width/2-120)+"px";
	nameField.style.display = "inline";

	// Initialize socket
	socket = io();

	// Initialise players array
	players = [];
	bullets = [];

	// Setup EventHandlers
	socket.on("set id", onSetId);
	socket.on("new player", onNewPlayer);
	socket.on("remove player", onRemovePlayer);
	socket.on("move player", onMovePlayer);
	socket.on("change hp player", onHpChangePlayer);

	socket.on("new bullet", onNewBullet);
	socket.on("remove bullet", onRemoveBullet);
	socket.on("move bullet", onMoveBullet);

	animate();
}

function onKeyPress(e) {
	// If enter is pressed
    if (e.keyCode === 13) {
        startPlay();
    }
}

function resetNameField() {
	nameField.style.display = "inline";
	nameField.disabled = false;
}

function startPlay() {
	// Disable nameField
	nameField.style.display = "none";
	nameField.disabled = true;
	// Request server to create new player
	socket.emit("new player", {name: nameField.value});
}

////////////////////SEND_KEYPRESS_EVENTS//////////////////////////

document.onkeydown = function(e) {
	if (e.keyCode === 68) {
		socket.emit('key press', {inputId:'d',state:true});
	} else if(e.keyCode === 83) {
		socket.emit('key press', {inputId:'s',state:true});
	} else if(e.keyCode === 65) {
		socket.emit('key press', {inputId:'a',state:true});
	} else if(e.keyCode === 87) {
		socket.emit('key press', {inputId:'w',state:true});
	}
}

document.onkeyup = function(e) {
	if (e.keyCode === 68) {
		socket.emit('key press', {inputId:'d',state:false});
	} else if(e.keyCode === 83) {
		socket.emit('key press', {inputId:'s',state:false});
	} else if(e.keyCode === 65) {
		socket.emit('key press', {inputId:'a',state:false});
	} else if(e.keyCode === 87) {
		socket.emit('key press', {inputId:'w',state:false});
	}
}

document.onmousedown = function(e) {
	if (e.button === 2) {
		socket.emit('button press', {inputId:'right',state:true});
	} else if (e.button === 0) {
		socket.emit('button press', {inputId:'left',state:true});
	}
}

document.onmouseup = function(e) {
	if (e.button === 2) {
		socket.emit('button press', {inputId:'right',state:false});
	} else if (e.button === 0) {
		socket.emit('button press', {inputId:'left',state:false});
	}
}

document.onmousemove = function(e) {
	updateMousePos(canvas, e);
	socket.emit('mouse move', {pos:mousePos});
}

function updateMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    mousePos = {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

////////////////////EVENT_HANDLERS//////////////////////////

function onSetId(data) {
	ownId = data.id;
}

function onNewPlayer(data) {
	var newPlayer = new Player(data.x, data.y, data.id, data.name);
	players.push(newPlayer);
}

function onRemovePlayer(data) {
	if(data.id === ownId) {
		resetNameField();
	}
	var removePlayer = playerById(data.id);
	if (removePlayer) {
		players.splice(players.indexOf(removePlayer), 1);
	}
}

function onMovePlayer(data) {
	var movePlayer = playerById(data.id);
	if (movePlayer) {
		movePlayer.setPos({x: data.x,y: data.y});
	}
}

function onHpChangePlayer(data) {
	var changePlayer = playerById(data.id);
	if (changePlayer) {
		changePlayer.hp = data.hp;
	}
}

function onNewBullet(data) {
	var newBullet = new Bullet(data.x, data.y, data.id);
	bullets.push(newBullet);
}

function onRemoveBullet(data) {
	var removeBullet = bulletById(data.id);
	if (removeBullet) {
		bullets.splice(bullets.indexOf(removeBullet), 1);
	}
}

function onMoveBullet(data) {
	var moveBullet = bulletById(data.id);
	if (moveBullet) {
		moveBullet.setPos({x:data.x,y:data.y});
	}
}

////////////////////UPDATE & ANIMATION//////////////////////////

function animate() {
	update();
	draw();
	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
}

function update() {
	// If player makes input, emit that input to server
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var i;
	for (i = 0; i < players.length; i++) {
		players[i].draw(ctx);
	}
	var j;
	for (j = 0; j < bullets.length; j++) {
		bullets[j].draw(ctx);
	}
	ctx.fillText(players.length,10,10);
}

function drawBg(can) {
	var mehCtx = can.getContext("2d");
	mehCtx.lineCap = "butt";
	mehCtx.lineWidth = 1;
	mehCtx.strokeStyle = '#ededed';
	mehCtx.beginPath();
	var num = 30;
	for(var i = 0; i < num; i ++) {
		mehCtx.moveTo(i*canvas.width/num,0);
		mehCtx.lineTo(i*canvas.width/num,canvas.height);
		mehCtx.stroke();
		mehCtx.moveTo(0,i*canvas.height/num);
		mehCtx.lineTo(canvas.width,i*canvas.height/num);
		mehCtx.stroke();
	}
	mehCtx.closePath();
}

////////////////////HELPERS//////////////////////////

function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id) {
			return players[i];
		}
	}
	return false;
}

function bulletById(id) {
	var i;
	for (i = 0; i < bullets.length; i++) {
		if (bullets[i].id == id) {
			return bullets[i];
		}
	}
	return false;
}