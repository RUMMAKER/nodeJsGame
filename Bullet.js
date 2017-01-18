function Bullet(startX, startY, speed, number, playerNumber) {
	this.dead = false; // Flag for server to check if Bullet is dead
	this.pos = {x: startX, y: startY};
	this.id = number;
	this.playerId = playerNumber;
	this.velocity = speed;
	Bullet.prototype.radius = 5;
	this.lifeCounter = 0;
	Bullet.prototype.lifeTime = 60;

	this.setSpeed = function(v) {
		this.velocity = normalize(this.velocity);
		this.velocity.x *= v;
		this.velocity.y *= v;
	}

	this.update = function() {
		this.move();
		if(this.lifeCounter > Bullet.prototype.lifeTime) {
			this.dead = true;
		}
		this.lifeCounter++;
	};

	this.move = function() {
		//move
		this.pos.x += this.velocity.x;
		this.pos.y += this.velocity.y;
	};
}

function normalize(v) {
	var m = mag(v);
	return {x: v.x/m, y: v.y/m};
}

function mag(v) {
	return Math.sqrt((v.x*v.x + v.y*v.y));
}

module.exports = Bullet;