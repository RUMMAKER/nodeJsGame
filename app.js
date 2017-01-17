var Player = require("./Player");
var Bullet = require("./Bullet");
var express = require('express');
var app = express();
//var http = require('http').Server(app);
var idCounter = 0;
var players = [];
var bullets = [];

var WIDTH = require("./GameVars").WIDTH;
var HEIGHT = require("./GameVars").HEIGHT;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public'));

/*
http.listen(3000, function(){
  console.log('listening on *:3000');
});
*/
app.set('port', (process.env.PORT || 3000));
var server = app.listen(app.get('port'), function() {
  console.log('listening on *:3000');
});
var io = require('socket.io')(server,{});//(http,{});

io.sockets.on("connection", onClientConnect);

////////////////////EVENT_HANDLERS//////////////////////////

function onClientConnect(client) {
	client.id = ++idCounter;
	client.emit("set id", {id: client.id});
	console.log("Player("+client.id+") has connected");
	client.on("disconnect", onClientDisconnect);
	client.on("new player", onNewPlayer);
	client.on("key press", onKeyPress);
	client.on("button press", onButtonPress);
	client.on("mouse move", onMouseMove);
}

function onNewPlayer(data) {
	console.log("Player("+this.id+") has joined");
	console.log(data.name);
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {name: existingPlayer.name, id: existingPlayer.id, x: existingPlayer.x, y: existingPlayer.y});
	};
	var newPlayer = new Player(Math.round(5+Math.random()*(WIDTH-10)), Math.round(5+Math.random()*(HEIGHT-10)), this.id, data.name);
	io.emit("new player", {name: newPlayer.name, id: newPlayer.id, x: newPlayer.x, y: newPlayer.y});		
	players.push(newPlayer);
}

function onKeyPress(data) {
	var movePlayer = playerById(this.id);
	if (movePlayer) {
		if(data.inputId === 'w') {
			movePlayer.w = data.state;
		} else if(data.inputId === 'a') {
			movePlayer.a = data.state;
		} else if(data.inputId === 's') {
			movePlayer.s = data.state;
		} else if(data.inputId === 'd') {
			movePlayer.d = data.state;
		}
	}
}

function onButtonPress(data) {
	var actionPlayer = playerById(this.id);
	if (actionPlayer) {
		if(data.inputId === 'left') {
			actionPlayer.shootTrigger = data.state;
		} else if(data.inputId === 'right') {
			actionPlayer.dashTrigger = data.state;
		} 
	}
}

function onMouseMove(data) {
	var actionPlayer = playerById(this.id);
	if (actionPlayer) {
		actionPlayer.mousePos = data.pos;
	}
}

function onClientDisconnect() {
	console.log("Player("+this.id+") has disconnected");
	var removePlayer = playerById(this.id);
	if (removePlayer) {
		players.splice(players.indexOf(removePlayer), 1);
		this.broadcast.emit("remove player", {id: this.id});
	}
}

////////////////////GAME_UPDATE_LOOP//////////////////////////

setInterval (function() {
	handleCollisions();
	handleBulletCollisions()
	updatePlayersState();
	updateBulletsState();
}, require("./GameVars").GAMELOOPRATE);

function updatePlayersState() {
	for(var i in players) {
		var player = players[i];
		player.update();
		player.reloadCounter++;
		/*//recover, refactor into player later
		player.hp += 0.1;
		if(player.hp > player.maxHp){
			player.hp = player.maxHp;
		}
		//*/
		handlePlayerShoot(player);	
		io.emit('move player', {	// Refactor to be update player (include health and shit)
			id: player.id,
			x: player.pos.x,
			y: player.pos.y
		});
	}
}

// shoot is called by the server, because server needs to keep track of bullets
function handlePlayerShoot(p) {
	var bullet = createBullet(p, ++idCounter);
	if(bullet) {
		io.emit("new bullet", {id: bullet.id, x: bullet.pos.x, y: bullet.pos.y});
		bullets.push(bullet);
	}
}

function createBullet(player, bulletNumber) {
	var diffVector = normalize({x: player.mousePos.x-player.pos.x, y: player.mousePos.y-player.pos.y});
	if(player.shootTrigger && player.reloadCounter > player.shootRate) {
		newBullet = new Bullet(player.pos.x, player.pos.y, {x:diffVector.x*7, y:diffVector.y*7}, bulletNumber, player.id);
		player.reloadCounter = 0;
		return newBullet;
	}
	return undefined;
}

function updateBulletsState() {
	for(var i in bullets) {
		var bullet = bullets[i];
		if(bullet.dead) {
			bullets.splice(bullets.indexOf(bullet), 1);
			io.emit("remove bullet", {id: bullet.id});
		} else {
			bullet.update();
			io.emit("move bullet", {id: bullet.id, x: bullet.pos.x, y: bullet.pos.y});
		}
	}
}

function handleCollisions() {
	// Handle player-player collisions
	var i,j;
	// Check every player vs every other player
	for(i = 0; i < players.length; i ++) {
		var player = players[i];
		for(j = i+1; j < players.length; j ++) {
			var otherPlayer = players[j];
			colHelper(player, otherPlayer);
		}
	}	
}

function handleBulletCollisions() {
	// Handle player-bullet collisions
	var i,j;
	// Check every bullet vs every player
	for(i = 0; i < bullets.length; i ++) {
		var bullet = bullets[i];
		for(j = 0; j < players.length; j ++) {
			var player = players[j];
			bulletColHelper(bullet,player);
		}
	}	
}

function colHelper(p1, p2) {
	// Modify p1 & p2's velocity depending on pos
	var diffVector = {x:p2.pos.x-p1.pos.x, y:p2.pos.y-p1.pos.y};
	if(mag(diffVector) < p1.radius*2) {
		diffVector = normalize(diffVector);
		p1.velocity.x = diffVector.x * -p1.dashSpeed;
		p1.velocity.y = diffVector.y * -p1.dashSpeed;
		p2.velocity.x = diffVector.x * p1.dashSpeed;
		p2.velocity.y = diffVector.y * p1.dashSpeed;

		//change both players hp
		p1.hp--;
		if(p1.hp > 0) {
			io.emit("change hp player", {id: p1.id, hp: p1.hp});
		} else {
			players.splice(players.indexOf(p1), 1);
			io.emit("remove player", {id: p1.id});
		}
		p2.hp--;
		if(p2.hp > 0) {
			io.emit("change hp player", {id: p2.id, hp: p2.hp});
		} else {
			players.splice(players.indexOf(p2), 1);
			io.emit("remove player", {id: p2.id});
		}
	}
}

function bulletColHelper(bullet, player) {
	if(bullet.playerId === player.id) {
		return; // No friednly fire
	}
	var diffVector = {x:bullet.pos.x-player.pos.x, y:bullet.pos.y-player.pos.y};
	if(mag(diffVector) < player.radius + bullet.radius) {
		//change hp player
		player.hp--;
		if(player.hp > 0) {
			io.emit("change hp player", {id: player.id, hp: player.hp});
		} else {
			players.splice(players.indexOf(player), 1);
			io.emit("remove player", {id: player.id});
		}
		//delete bullet
		bullets.splice(bullets.indexOf(bullet), 1);
		io.emit("remove bullet", {id: bullet.id});
	}
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

function normalize(v) {
	var m = mag(v);
	return {x: v.x/m, y: v.y/m};
}

function mag(v) {
	return Math.sqrt((v.x*v.x + v.y*v.y));
}