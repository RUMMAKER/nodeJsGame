var Bullet = require("./Bullet");

function Player(startX, startY, number, nameTag) {
	this.hp = 10;
	this.pos = {x: startX, y: startY};
	this.id = number;
	this.name = nameTag;
	this.velocity = {x: 0, y: 0};

	this.dashCounter = 0;
	this.reloadCounter = 0;
	this.dashTrigger = false;
	this.shootTrigger = false;
	this.mousePos = {x: startX, y: startY};

	this.w = false;
	this.a = false;
	this.s = false;
	this.d = false;
	Player.prototype.radius = 9;
	var percentFric = 0.1;
	var friction = 0.8;
	this.accel = 1;
	Player.prototype.shootRate = 10;
	Player.prototype.dashSpeed = 20;
	var dashRate = 30;

	this.update = function() {
		//REFACTOR SHIT INTO THIS 1 FUNCTION
		this.move();
		this.accel = 0.9+3/(mag(this.velocity)+2.5);
		if(this.dashTrigger && this.dashCounter > dashRate){
			this.dash();
		}
		this.dashCounter ++;
	};

	this.dash = function() {
		var diffVector = normalize({x:this.mousePos.x-this.pos.x,y:this.mousePos.y-this.pos.y});
		this.velocity.x = diffVector.x*Player.prototype.dashSpeed;
		this.velocity.y = diffVector.y*Player.prototype.dashSpeed;
		this.dashCounter = 0;
		this.dashTrigger = false;
	};

	this.move = function() {
		//move
		this.pos.x += this.velocity.x;
		this.pos.y += this.velocity.y;
		this.keepInBound();
		//update speed
		this.updateVelocity();
	};

	this.keepInBound = function() {
		//HEIGHT = 700
		//WIDTH = 900
		if(this.pos.x > 900-Player.prototype.radius){
			this.pos.x = 900-Player.prototype.radius;
		} else if (this.pos.x < Player.prototype.radius) {
			this.pos.x = Player.prototype.radius;
		}

		if(this.pos.y > 700-Player.prototype.radius){
			this.pos.y = 700-Player.prototype.radius;
		} else if (this.pos.y < Player.prototype.radius) {
			this.pos.y = Player.prototype.radius;
		}
	}

	this.updateVelocity = function() {
		//frictionslow
		this.frictionSlow();
		//calculate velocity change based on key input
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
			this.velocity.y += vertical*0.7*this.accel;
			this.velocity.x += horizontal*0.7*this.accel;
		} else if (vertical == 0 && horizontal == 0) {
			//do nothing
		} else {
			this.velocity.y += vertical*this.accel;
			this.velocity.x += horizontal*this.accel;
		}
	};

	this.frictionSlow = function() {
		var normed = normalize(this.velocity);
		var xSlow = normed.x * friction;
		var ySlow = normed.y * friction;
		if(Math.abs(xSlow) < Math.abs(this.velocity.x)) {
			this.velocity.x -= xSlow;
		} else {
			this.velocity.x = 0;
		}

		if(Math.abs(ySlow) < Math.abs(this.velocity.y)) {
			this.velocity.y -= ySlow;
		} else {
			this.velocity.y = 0;
		}
		//percent slow
		this.velocity.x -= this.velocity.x*percentFric;
		this.velocity.y -= this.velocity.y*percentFric;
	};

}

function normalize(v) {
	var m = mag(v);
	return {x: v.x/m, y: v.y/m};
}

function mag(v) {
	return Math.sqrt((v.x*v.x + v.y*v.y));
}

module.exports = Player;