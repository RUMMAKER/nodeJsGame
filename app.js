var Player = require("./Player");
var express = require('express');
var app = express();
//var http = require('http').Server(app);
var idCounter = 0;
var players = [];

var WIDTH = 1000;
var HEIGHT = 1000;

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
	console.log("Player("+client.id+") has connected");
	client.on("disconnect", onClientDisconnect);
	client.on("new player", onNewPlayer);
	client.on("key press", onKeyPress);
	client.on("button press", onButtonPress);
}

function onNewPlayer(data) {
	console.log("Player("+this.id+") has joined");
	console.log(data.name);
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {name: existingPlayer.name, id: existingPlayer.id, x: existingPlayer.x, y: existingPlayer.y});
	};
	//Math.round(5+Math.random()*(WIDTH-10)), Math.round(5+Math.random()*(HEIGHT-10))
	var newPlayer = new Player(10, 10, this.id, data.name);
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
	for(var i in players) {
		var player = players[i];
		//handleHitDetections
		handleCollisions();
		player.update();
		io.emit('move player', {	// Refactor to be update player (include health and shit)
			id: player.id,
			x: player.pos.x,
			y: player.pos.y
		});
	}
}, 1000/25);

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

function colHelper(p1, p2) {
	// Modify p1 & p2's velocity depending on pos
	var diffVector = {x:p2.pos.x-p1.pos.x, y:p2.pos.y-p1.pos.y};
	if(mag(diffVector) < p1.radius*2) {
		diffVector = normalize(diffVector);
		p1.velocity.x = diffVector.x * -25; //same as dash
		p1.velocity.y = diffVector.y * -25;
		p2.velocity.x = diffVector.x * 25; //same as dash
		p2.velocity.y = diffVector.y * 25;
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