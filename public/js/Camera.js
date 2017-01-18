function Camera(p) {
	this.pos = {x: 0, y: 0};
	this.player = p;

	this.update = function() {
		if(this.player) {
			this.pos.x = this.player.pos.x;
			this.pos.y = this.player.pos.y;
		}
	};
}