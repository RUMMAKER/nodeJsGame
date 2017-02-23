function init() {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	maskCanvas = document.getElementById("maskCanvas");
	nameField = document.getElementById("playerNameField");
	ctx = canvas.getContext("2d");
	maskCtx = maskCanvas.getContext("2d");

	// Maximise the canvas
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	SCALE = (canvas.width*canvas.height)/50000;
	if(SCALE < 15) {
		SCALE = 15;
	}
	maskCanvas.width = window.innerWidth;
	maskCanvas.height = window.innerHeight;

	// Center nameField
	nameField.style.top = (canvas.height/2-30)+"px";
	nameField.style.left = (canvas.width/2-120)+"px";
	nameField.style.display = "inline";

	// Initialize socket
	socket = io();

	// Initialise players array
	players = [];
	bullets = [];
	blocks = [];

	// Setup EventHandlers
	socket.on("new block", onNewBlock);
	socket.on("set id", onSetId);
	socket.on("new player", onNewPlayer);
	socket.on("remove player", onRemovePlayer);
	socket.on("move player", onMovePlayer);
	/*
	socket.on("change hp player", onHpChangePlayer);

	socket.on("new bullet", onNewBullet);
	socket.on("remove bullet", onRemoveBullet);
	socket.on("move bullet", onMoveBullet);
	*/
	animate();
	window.addEventListener("resize", onResize, false);
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

/*
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
	updateMousePos(e);
	socket.emit('mouse move', {pos:mousePos});
}

function updateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    mousePos = {
      x: evt.clientX - rect.left - currentCtxTransform.x,
      y: evt.clientY - rect.top - currentCtxTransform.y
    };
}

// Call this when viewport moves
function updateMousePos2() {
    var rect = canvas.getBoundingClientRect();
    var pX = mousePos.x;
    var pY = mousePos.y;
    mousePos = {
      x: pX + prevCtxTransform.x - currentCtxTransform.x,
      y: pY + prevCtxTransform.y - currentCtxTransform.y
    };
}
*/

////////////////////EVENT_HANDLERS//////////////////////////

function onNewBlock(data) {
	//
	var newBlock = new Block(data.x, data.y, data.width, data.height);
	blocks.push(newBlock);
}

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

/*
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
*/

function onResize(e) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	nameField.style.top = (canvas.height/2-30)+"px";
	nameField.style.left = (canvas.width/2-120)+"px";
	//adjust SCALE here
	SCALE = (canvas.width*canvas.height)/50000;
	if(SCALE < 15) {
		SCALE = 15;
	}
	maskCanvas.width = window.innerWidth;
	maskCanvas.height = window.innerHeight;
}

////////////////////UPDATE & ANIMATION//////////////////////////

function animate() {
	update();
	draw();
	window.requestAnimFrame(animate);
}

function update() {
}

function draw() {
	var ownPlayer = playerById(ownId);
	if(!ownPlayer){
		return;
	}

	var elapsedTime = Date.now() - prevAnimTime;
	prevAnimTime = Date.now();
	updateContextsTransforms(elapsedTime);
	
	//updateMousePos2();
	socket.emit('mouse move', {pos:mousePos});
	raycastFromPoint(new b2Vec2(ownPlayer.lerpedPos.x, ownPlayer.lerpedPos.y), blocks, ctx);

	// Draw everything on game canvas
	for (var i = 0; i < players.length; i++) {
		players[i].draw(ctx, elapsedTime);
	}
	for (var i = 0; i < blocks.length; i++) {
		blocks[i].draw(ctx);
	}
	cutoutNotSeen(ctx); // Erase all not in LoS in game canvas

	// Draw all things we want to be able to see through fog on mask canvas
	for (var i = 0; i < blocks.length; i++) {
		blocks[i].draw(maskCtx);
	}
	// Draw fog in mask canvas
	maskCtx.fillStyle="black";
	maskCtx.globalAlpha = 0.6;
	maskCtx.fillRect(0,0,WIDTH*SCALE,HEIGHT*SCALE);
	maskCtx.globalAlpha = 1;

	cutoutSeen(maskCtx); // Erase all in LoS in mask canvas
	ctx.drawImage(maskCanvas, -currentCtxTransform.x, -currentCtxTransform.y); // Draw mask canvas onto game canvas
	/*
	for (var i = 0; i < bullets.length; i++) {
		bullets[i].draw(ctx, elapsedTime);
	}*/
}

function updateContextsTransforms(elapsedTime) {
	ctx.setTransform(1,0,0,1,0,0);//reset the transform matrix as it is cumulative
    ctx.clearRect(0, 0, canvas.width, canvas.height);//clear the viewport AFTER the matrix is reset
    maskCtx.setTransform(1,0,0,1,0,0);//reset the transform matrix as it is cumulative
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);//clear the viewport AFTER the matrix is reset
	//Clamp the camera position to the world bounds while centering the camera around the player
    var ownPlayer = playerById(ownId);
    if(ownPlayer) {
    	var offSet = ownPlayer.calcLerp(elapsedTime);
		var camX = clamp(canvas.width/2-offSet.x*SCALE, -(WIDTH*SCALE - canvas.width), 0);
		var camY = clamp(canvas.height/2-offSet.y*SCALE, -(HEIGHT*SCALE - canvas.height), 0);
		ctx.translate( camX, camY );
		maskCtx.translate( camX, camY );
		prevCtxTransform.x = currentCtxTransform.x;
		prevCtxTransform.y = currentCtxTransform.y;
		currentCtxTransform.x = camX;
		currentCtxTransform.y = camY;
	}
}

function convertCanvasToImage(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	console.log(image.src);
	return image;
}

////////////////////HELPERS//////////////////////////

function playerById(id) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].id == id) {
			return players[i];
		}
	}
	return false;
}

function bulletById(id) {
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].id == id) {
			return bullets[i];
		}
	}
	return false;
}

function clamp(value, min, max){
    if(value < min) return min;
    else if(value > max) return max;
    return value;
}