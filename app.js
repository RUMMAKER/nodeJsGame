var Player = require("./Player");
var Bullet = require("./Bullet");
var GameVars = require("./GameVars");
var express = require('express');
var app = express();

var idCounter = 0;
var sockets = [];
var players = [];
var bullets = [];
// consider using object instead of array

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT || 3000));
var server = app.listen(app.get('port'), function() {
  console.log('listening on *:3000');
});
var io = require('socket.io')(server,{});
io.sockets.on("connection", onClientConnect);

////////////////////INIT_STUFF//////////////////////////
var Box2D = require("box2dweb");
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

// make walls
var MapGen = require("./MapGen");
var ins = new MapGen();
var blockList = ins.generateMap(); // RMBR to keep track of blocks
/*
var mapString = "";
for(var y = 0; y < GameVars.GRIDHEIGHT; y ++) {
	for(var x = 0; x < GameVars.GRIDWIDTH; x ++) {
		if(GameVars.GRID[x][y]) {
			mapString += "   ";
		} else {
			mapString += "ooo";
		}
	}
	mapString += "\n";
	for(var x = 0; x < GameVars.GRIDWIDTH; x ++) {
		if(GameVars.GRID[x][y]) {
			mapString += "   ";
		} else {
			mapString += "ooo";
		}
	}
	mapString += "\n";
}
console.log(mapString);
*/

////////////////////PHYSICS_STUFF//////////////////////////

var WORLD = require("./GameVars").WORLD;
function physicsStep() {
	WORLD.Step(1/GameVars.GAMELOOPRATE, 8, 3);
}

var listener = new Box2D.Dynamics.b2ContactListener;
listener.BeginContact = function (contact) {
  //
  //contact.GetFixtureA().GetBody().GetUserData().constructor.name;
  //contact.GetFixtureB().GetBody().GetUserData().constructor.name;
  //if name = player ... etc etc, handle that here
  //
}
WORLD.SetContactListener(listener);

////////////////////EVENT_HANDLERS//////////////////////////

function onClientConnect(client) {
	sockets.push(client);
	client.id = ++idCounter;
	client.emit("set id", {id: client.id});
	console.log("("+client.id+") has connected");
	client.on("disconnect", onClientDisconnect);
	client.on("new player", onNewPlayer);
	client.on("key press", onKeyPress);
	//client.on("button press", onButtonPress);
	client.on("mouse move", onMouseMove);

	for (var i = 0; i < blockList.length; i++) {
		var b = blockList[i];
		client.emit("new block", {x: b.x, y: b.y, width: b.width, height: b.height});
	}
}

function onClientDisconnect() {
	console.log("("+this.id+") has disconnected");
	var removePlayer = playerById(this.id);
	if (removePlayer) {
		players.splice(players.indexOf(removePlayer), 1);
		this.broadcast.emit("remove player", {id: this.id});
		sockets.splice(sockets.indexOf(socketById(this.id)), 1);
	}
}

function onNewPlayer(data) {
	console.log(data.name+"("+this.id+") has joined");
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {name: existingPlayer.name, id: existingPlayer.id, x: existingPlayer.body.GetPosition().x, y: existingPlayer.body.GetPosition().y});
	};

	var validSpawnPosition = {x: Math.round(Math.random()*(GameVars.GRIDWIDTH-1)), y: Math.round(Math.random()*(GameVars.GRIDHEIGHT-1))};
	while(GameVars.GRID[validSpawnPosition.x][validSpawnPosition.y] == true) {
		validSpawnPosition = {x: Math.round(Math.random()*(GameVars.GRIDWIDTH-1)), y: Math.round(Math.random()*(GameVars.GRIDHEIGHT-1))};
	}

	var newPlayer = new Player(
		this.id,
		validSpawnPosition.x*GameVars.GRIDSIZE+GameVars.GRIDSIZE/2,
		validSpawnPosition.y*GameVars.GRIDSIZE+GameVars.GRIDSIZE/2,
		{moveSpeed: 0.24, radius: 0.8, linearFriction: 0.05, percentFriction: 0.05},
		data.name
	);
	io.emit("new player", {name: newPlayer.name, id: newPlayer.id, x: newPlayer.body.GetPosition().x, y: newPlayer.body.GetPosition().y});		
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

// function onButtonPress(data) {
// 	var actionPlayer = playerById(this.id);
// 	if (actionPlayer) {
// 		if(data.inputId === 'left') {
// 			actionPlayer.shootTrigger = data.state;
// 		} else if(data.inputId === 'right') {
// 			actionPlayer.dashTrigger = data.state;
// 		} 
// 	}
// }

function onMouseMove(data) {
	var actionPlayer = playerById(this.id);
	if (actionPlayer) {
		actionPlayer.mousePos = data.pos;
	}
}



////////////////////GAME_UPDATE_LOOP//////////////////////////

setInterval (function() {
	updatePlayers();
	physicsStep();
	sendPlayersPos();
}, GameVars.GAMELOOPRATE);

function updatePlayers() {
	for (var i = 0; i < players.length; i++) {
		players[i].update();
	}
}

function sendPlayersPos() {
	for (var i = 0; i < players.length; i++) {
		io.emit("move player", {id: players[i].id, x: players[i].body.GetPosition().x, y: players[i].body.GetPosition().y, mouseX: players[i].mousePos.x, mouseY: players[i].mousePos.y});
	}
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

function socketById(id) {
	for (var i = 0; i < sockets.length; i++) {
		if (sockets[i].id == id) {
			return sockets[i];
		}
	}
	return false;
}