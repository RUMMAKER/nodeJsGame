var PhysicsBody = require("./PhysicsBody");
var WIDTH = require("./GameVars").WIDTH;
var HEIGHT = require("./GameVars").HEIGHT;
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

function Player(objectId, world, details, scale, hp, ability1, ability2, ability1Time, ability2Time, name) {
	PhysicsBody.call(this, objectId, world, details, scale);

	this.name = name;
	
	this.rightDown = false;
	this.leftDown = false;
	this.rightCounter = 0;
	this.leftCounter = 0;
	this.rightRate = ability2Time;
	this.leftRate = ability1Time;

	this.mousePos = {x: 0, y: 0};

	this.w = false;
	this.a = false;
	this.s = false;
	this.d = false;
	this.accel = 1/scale;

	this.update = function() {	
		this.move();
	};

	this.move = function() {
		//update speed
		this.updateVelocity();
		this.keepInBound();
	};

	this.keepInBound = function() {
		if(this.body.GetPosition().x*scale > WIDTH-this.details.radius*scale){
			this.body.GetPosition().x = WIDTH/scale-this.details.radius;
		} else if (this.body.GetPosition().x*scale < this.details.radius*scale) {
			this.body.GetPosition().x = this.details.radius;
		}

		if(this.body.GetPosition().y*scale > HEIGHT-this.details.radius*scale){
			this.body.GetPosition().y = HEIGHT/scale-this.details.radius;
		} else if (this.body.GetPosition().y*scale < this.details.radius*scale) {
			this.body.GetPosition().y = this.details.radius;
		}
	}

	this.updateVelocity = function() {
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
			this.body.ApplyForce(new b2Vec2(horizontal*0.7*this.accel, vertical*0.7*this.accel), this.body.GetPosition());
		} else if (vertical == 0 && horizontal == 0) {
			//do nothing
		} else {
			this.body.ApplyForce(new b2Vec2(horizontal*this.accel, vertical*this.accel), this.body.GetPosition());
		}
	};
}

Player.prototype.moveForce = 0.5;
Player.prototype.leftRate = 10;
Player.prototype.rightRate = 20;
module.exports = Player;