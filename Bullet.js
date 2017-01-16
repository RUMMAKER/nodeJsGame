function Bullet(startX, startY, speed, number, playerNumber) {
	this.dead = false; // Flag for server to check if Bullet is dead
	this.pos = {x: startX, y: startY};
	this.id = number;
	this.playerId = playerNumber;
	this.velocity = speed;
	Bullet.prototype.radius = 3;
	this.lifeCounter = 0;
	Bullet.prototype.lifeTime = 14;

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

module.exports = Bullet;