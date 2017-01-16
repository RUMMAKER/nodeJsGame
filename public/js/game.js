var canvas,			// Canvas DOM element
	nameField,		// Input DOM element
	ctx,			// Canvas rendering context
	players,		// Array of all players
	mousePos,		// Current mousePosition, relative to canvas
	socket;			// Socket connection

function init() {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	nameField = document.getElementById("playerNameField");
	ctx = canvas.getContext("2d");
	ctx.font="bold 20px Arial";

	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Center nameField
	nameField.style.top = (window.innerHeight/2-30)+"px";
	nameField.style.left = (window.innerWidth/2-120)+"px";
	nameField.style.display = "inline";

	// Initialize socket
	socket = io();
}

function onKeyPress(e) {
	// If enter is pressed
    if (e.keyCode === 13) {
        startPlay();
    }
}

function startPlay() {
	// Disable nameField
	nameField.style.display = "none";
	nameField.disabled = true;

	// Initialise players array
	players = [];

	// Request server to create new player
	socket.emit("new player", {name: nameField.value});

	// Setup EventHandlers
	socket.on("new player", onNewPlayer);
	socket.on("remove player", onRemovePlayer);
	socket.on("move player", onMovePlayer);

	animate();
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
		socket.emit('button press', {inputId:'right',state:true,pos:mousePos});
	} else if (e.button === 0) {
		socket.emit('button press', {inputId:'left',state:true,pos:mousePos});
	}
}

document.onmouseup = function(e) {
	if (e.button === 2) {
		socket.emit('button press', {inputId:'right',state:false,pos:mousePos});
	} else if (e.button === 0) {
		socket.emit('button press', {inputId:'left',state:false,pos:mousePos});
	}
}

document.onmousemove = function(e) {
	updateMousePos(canvas, e);
}

function updateMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    mousePos = {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

////////////////////EVENT_HANDLERS//////////////////////////

function onNewPlayer(data) {
	var newPlayer = new Player(data.x, data.y, data.id, data.name);
	players.push(newPlayer);
}

function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);
	if (removePlayer) {
		remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
	}
}

function onMovePlayer(data) {
	var movePlayer = playerById(data.id);
	if (movePlayer) {
		movePlayer.setPos({x: data.x,y: data.y});
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
	ctx.fillText(players.length,10,10);
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