var PhysicsBody = require("./PhysicsBody");
var GameVars = require("./GameVars");
var Box2D = require("box2dweb");
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2Body = Box2D.Dynamics.b2Body;

function SolidBlock(objectId, x, y, width, height) {
	var shape = new b2PolygonShape();
	shape.SetAsBox(width/2, height/2);
	PhysicsBody.call(
		this,
		objectId,
		{userData: this, linearVelocity: new b2Vec2(0,0), type: b2Body.b2_staticBody, position: new b2Vec2(x + width/2, y + height/2), active: true, allowSleep: true, angle: 0, angularVelocity: 0, awake: true, bullet: false, fixedRotation: true},
		{shape: shape, density: 1, friction: 0.1, restitution: 0.1}
	);
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
}

SolidBlock.prototype = Object.create(PhysicsBody.prototype);
module.exports = SolidBlock;