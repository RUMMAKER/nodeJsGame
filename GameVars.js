var Box2D = require("box2dweb");
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2World = Box2D.Dynamics.b2World;
module.exports = {
	GAMELOOPRATE: 20,
	WIDTH: 100,//in meters
	HEIGHT: 100,//in meters
	WORLD: new b2World(new b2Vec2(0,0), true),
};