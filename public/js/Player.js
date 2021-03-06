function Player(startX, startY, number, nameTag) {
	this.hp = 10;
	this.maxHp = 10;
	this.drawCounter = 0; // Tied to this.draw => tied to animate => window frame rate
	this.prevPos = {x: startX, y:startY};
	this.pos = {x: startX, y: startY};
	this.lerpedPos = {x: startX, y: startY};
	this.id = number;
	this.name = nameTag;
	var radius = 0.8; // REMEMBER TO REPLACE THIS WITH SOMETHING PASSED FROM SERVER

	this.mousePos = {x: 0, y: 0};
	
	this.setPos = function(v) {
		this.prevPos.x = this.pos.x;
		this.prevPos.y = this.pos.y;
		this.pos.x = v.x;
		this.pos.y = v.y;
		this.drawCounter = 0;
	};

	this.calcLerp = function(timeSinceLastDraw) {
		return lerp(this.prevPos, this.pos, this.drawCounter + GAMELOOPRATE/timeSinceLastDraw);
	};

	this.draw = function(ctx, timeSinceLastDraw) {
		this.drawCounter += GAMELOOPRATE/timeSinceLastDraw;
		this.lerpedPos = lerp(this.prevPos, this.pos, this.drawCounter);

		ctx.beginPath();
	    ctx.arc(this.lerpedPos.x*SCALE, this.lerpedPos.y*SCALE, radius*SCALE, 0, 2 * Math.PI, false);
	    ctx.fillStyle = '#232323';
	    ctx.fill();
	    ctx.lineWidth=radius*SCALE*0.1;
	    ctx.strokeStyle = 'black';
      	ctx.stroke();
	    ctx.closePath();

	    ctx.font="bold 12px arial";
	    ctx.textAlign = "center";
	    ctx.fillText(this.name,this.lerpedPos.x*SCALE,this.lerpedPos.y*SCALE-1.75*radius*SCALE);

	    // Draw hpBar
	    ctx.lineCap = 'round';
	    var missingPercent = (this.maxHp-this.hp)/this.maxHp;
	    ctx.strokeStyle = '#303030';
	    var barWidth=radius*SCALE*4;
	    ctx.lineWidth=radius*SCALE*0.5;
	    ctx.beginPath();
		ctx.moveTo(this.lerpedPos.x*SCALE-barWidth/2,this.lerpedPos.y*SCALE+1.75*radius*SCALE);
		ctx.lineTo(this.lerpedPos.x*SCALE+barWidth/2,this.lerpedPos.y*SCALE+1.75*radius*SCALE);
		ctx.stroke();
		ctx.closePath();

		ctx.strokeStyle = '#99ff66';
		ctx.lineWidth=radius*SCALE*0.3;
		ctx.beginPath();
		ctx.moveTo(this.lerpedPos.x*SCALE-barWidth/2,this.lerpedPos.y*SCALE+1.75*radius*SCALE);
		ctx.lineTo(this.lerpedPos.x*SCALE+barWidth/2-(missingPercent*barWidth),this.lerpedPos.y*SCALE+1.75*radius*SCALE);
		ctx.stroke();
		ctx.closePath();

		// Draw eyes
		eyeOffset = new b2Vec2(this.mousePos.x-this.lerpedPos.x, this.mousePos.y-this.lerpedPos.y);
		eyeOffset.Normalize();
		eyePerp = getPerpendicularVec(eyeOffset.x, eyeOffset.y);

		ctx.beginPath();
	    ctx.arc((this.lerpedPos.x+eyeOffset.x*radius*0.6+eyePerp.x*radius*0.3)*SCALE, (this.lerpedPos.y+eyeOffset.y*radius*0.6+eyePerp.y*radius*0.3)*SCALE, radius*0.1*SCALE, 0, 2 * Math.PI, false);
	    ctx.fillStyle = 'white';
	    ctx.fill();
	    ctx.closePath();

	    ctx.beginPath();
	    ctx.arc((this.lerpedPos.x+eyeOffset.x*radius*0.6-eyePerp.x*radius*0.3)*SCALE, (this.lerpedPos.y+eyeOffset.y*radius*0.6-eyePerp.y*radius*0.3)*SCALE, radius*0.1*SCALE, 0, 2 * Math.PI, false);
	    ctx.fillStyle = 'white';
	    ctx.fill();
	    ctx.closePath();
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

	function getPerpendicularVec(x,y) {
		var dir = new b2Vec2(x, y);
		dir.Normalize();
		var dirX = dir.x;
		dir.x = -dir.y;
		dir.y = dirX;
		return dir;
	}
}