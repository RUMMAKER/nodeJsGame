var Box2D = require("box2dweb");
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2World = Box2D.Dynamics.b2World;

var GRIDSIZE = 2;
var GRIDWIDTH = 50;
var GRIDHEIGHT = 50;
var GRID = new Array(GRIDWIDTH); // GRID stores bools indicating a wall
for(var i = 0; i < GRID.length; i ++) {
	GRID[i] = new Array(GRIDHEIGHT);
}
module.exports = {
	GRIDSIZE: GRIDSIZE,
	GRIDWIDTH: GRIDWIDTH,
	GRIDHEIGHT: GRIDHEIGHT,
	GRID: GRID,

	GAMELOOPRATE: 20,
	WIDTH: GRIDSIZE*GRIDWIDTH,//in meters
	HEIGHT: GRIDSIZE*GRIDHEIGHT,//in meters
	WORLD: new b2World(new b2Vec2(0,0), true)
};