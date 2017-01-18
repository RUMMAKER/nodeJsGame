function Player(startX, startY, number, nameTag) {
	this.hp = 10;
	this.maxHp = 10;
	this.drawCounter = 0; // Tied to this.draw => tied to animate => window frame rate
	this.prevPos = {x: startX, y:startY};
	this.pos = {x: startX, y: startY};
	this.lerpedPos = {x: startX, y: startY};
	this.id = number;
	this.name = nameTag;
	this.w = false;
	this.a = false;
	this.s = false;
	this.d = false;
	var radius = 12;
	var lerpRate = 0.025*GAMELOOPRATE;
	
	this.setPos = function(v) {
		this.prevPos.x = this.pos.x;
		this.prevPos.y = this.pos.y;
		this.pos.x = v.x;
		this.pos.y = v.y;
		this.drawCounter = 0;
	}

	this.calcLerp = function() {
		this.lerpedPos = lerp(this.prevPos, this.pos, this.drawCounter);
	}

	this.draw = function(ctx) {
		this.lerpedPos = lerp(this.prevPos, this.pos, this.drawCounter);
		ctx.beginPath();
	    ctx.arc(this.lerpedPos.x, this.lerpedPos.y, radius, 0, 2 * Math.PI, false);
	    ctx.fillStyle = 'black';
	    ctx.fill();
	    ctx.closePath();
	    ctx.textAlign = "center";
	    ctx.fillText(this.name,this.lerpedPos.x,this.lerpedPos.y-1.75*radius);

	    // Draw hpBar
	    ctx.lineCap = 'round';
	    var missingPercent = (this.maxHp-this.hp)/this.maxHp;
	    ctx.strokeStyle = '#303030';
	    var barWidth=radius*4;
	    ctx.lineWidth=radius*0.5;
	    ctx.beginPath();
		ctx.moveTo(this.lerpedPos.x-barWidth/2,this.lerpedPos.y+1.75*radius);
		ctx.lineTo(this.lerpedPos.x+barWidth/2,this.lerpedPos.y+1.75*radius);
		ctx.stroke();
		ctx.closePath();

		ctx.strokeStyle = '#99ff66';
		ctx.lineWidth=radius*0.3;
		ctx.beginPath();
		ctx.moveTo(this.lerpedPos.x-barWidth/2,this.lerpedPos.y+1.75*radius);
		ctx.lineTo(this.lerpedPos.x+barWidth/2-(missingPercent*barWidth),this.lerpedPos.y+1.75*radius);
		ctx.stroke();
		ctx.closePath();
	    this.drawCounter += lerpRate;
	};

	// Takes in 2 vector2s and return a vector2
	function lerp(a,b,t) {
		if(t > 1){
			t = 1;
		}
		var xDiff = b.x-a.x;
		var yDiff = b.y-a.y;
		return {x: a.x + xDiff*t, y: a.y + yDiff*t};
	}
}