var PhysicsBody = require("./PhysicsBody");
var GameVars = require("./GameVars");
var Box2D = require("box2dweb");
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2Body = Box2D.Dynamics.b2Body;

// details = {moveSpeed,percentFriction,linearFriction,radius}
function Player(objectId, startX, startY, details, name) {
	PhysicsBody.call(
		this,
		objectId,
		{userData: this, linearVelocity: new b2Vec2(0,0), type: b2Body.b2_dynamicBody, position: new b2Vec2(startX, startY), active: true, allowSleep: true, angle: 0, angularVelocity: 0, awake: true, bullet: false, fixedRotation: true},
		{shape: new b2CircleShape(details.radius), density: details.radius*0.1, friction: 0.1, restitution: 0.1}
	);
	this.details = details;
	this.name = name;
	this.mousePos = {x: 0, y: 0};
	this.w = false;
	this.a = false;
	this.s = false;
	this.d = false;
}

Player.prototype = Object.create(PhysicsBody.prototype);
Player.prototype.updateVelocity = function() {
	var vertical = 0;
	var horizontal = 0;
	if(this.w){
		vertical = -1;
	} else if(this.s) {
		vertical = 1;
	}
	if(this.a){
		horizontal = -1;
	} else if(this.d) {
		horizontal = 1;
	}

	if(vertical != 0 && horizontal != 0) {
		this.body.ApplyImpulse(new b2Vec2(horizontal*0.709*this.details.moveSpeed, vertical*0.709*this.details.moveSpeed), this.body.GetPosition());
	} else if (vertical != 0 || horizontal != 0) {
		this.body.ApplyImpulse(new b2Vec2(horizontal*this.details.moveSpeed, vertical*this.details.moveSpeed), this.body.GetPosition());
	}
};
Player.prototype.frictionSlow = function() {
	var v = this.body.GetLinearVelocity();
	var percentV = new b2Vec2(-this.details.percentFriction*v.x,-this.details.percentFriction*v.y);
	var remainderV = new b2Vec2(-v.x-percentV.x,-v.y-percentV.y);
	if(remainderV.Length() > this.details.linearFriction) {
		remainderV.Normalize();
		remainderV.x *= this.details.linearFriction;
		remainderV.y *= this.details.linearFriction;
		remainderV.Add(percentV);
		this.body.ApplyImpulse(remainderV, this.body.GetPosition());
	} else {
		//remainderV.Add(percentV);
		//this.body.ApplyImpulse(remainderV, this.body.GetPosition());
		this.body.SetLinearVelocity(new b2Vec2(0,0));
	}
};
Player.prototype.keepInBound = function() {
	if(this.body.GetPosition().x > GameVars.WIDTH-this.details.radius){
		this.body.SetPosition(new b2Vec2(GameVars.WIDTH-this.details.radius, this.body.GetPosition().y));
	} else if (this.body.GetPosition().x < this.details.radius) {
		this.body.SetPosition(new b2Vec2(this.details.radius, this.body.GetPosition().y));
	}

	if(this.body.GetPosition().y > GameVars.HEIGHT-this.details.radius){
		this.body.SetPosition(new b2Vec2(this.body.GetPosition().x, GameVars.HEIGHT-this.details.radius));
	} else if (this.body.GetPosition().y < this.details.radius) {
		this.body.SetPosition(new b2Vec2(this.body.GetPosition().x, this.details.radius));
	}
};
Player.prototype.update = function() {	
	//console.log(this.body.GetPosition().x + "," + this.body.GetPosition().y);
	this.move();
};
Player.prototype.move = function() {
	this.frictionSlow();
	this.updateVelocity();
	this.keepInBound();
};
module.exports = Player;