function Player(startX, startY, number, nameTag) {
	this.x = startX;
	this.y = startY;
	this.id = number;
	this.name = nameTag;
	this.w = false;
	this.a = false;
	this.s = false;
	this.d = false;
	var radius = 9;
	
	this.draw = function(ctx) {
		ctx.beginPath();
	    ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI, false);
	    ctx.fillStyle = 'black';
	    ctx.fill();
	    ctx.closePath();
	    ctx.textAlign = "center";
	    ctx.fillText(this.name,this.x,this.y-2*radius);
	};
}