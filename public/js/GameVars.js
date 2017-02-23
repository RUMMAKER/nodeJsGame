var GAMELOOPRATE = 20;
var WIDTH = 100;
var HEIGHT = 100;
var SCALE = 20;
var WORLD = new b2World(new b2Vec2(0,0), true);

var canvas;			// Canvas DOM element
var maskCanvas;		
var	nameField;		// Input DOM element
var	ctx;			// Canvas rendering context
var maskCtx;
var	players;		// Array of all players
var	bullets;		// Array of all bullets
var	mousePos;		// Current mousePosition, relative to canvas
var	ownId;			// Used to identify when ur own player died
var	socket;			// Socket connection

var blocks;
var currentCtxTransform = {x:0,y:0};
var prevCtxTransform = {x:0,y:0};

var prevAnimTime = window.performance.now();