function Block(gridX, gridY, gridWidth, gridHeight) {
	this.gridX = gridX;
	this.gridY = gridY;
	this.gridWidth = gridWidth;
	this.gridHeight = gridHeight;
	this.draw = function(ctx) {
		ctx.beginPath();
		ctx.rect(this.gridX*GRIDSIZE*SCALE,this.gridY*GRIDSIZE*SCALE, this.gridWidth*GRIDSIZE*SCALE,this.gridHeight*GRIDSIZE*SCALE);
	    ctx.fillStyle = 'black';
	    ctx.fill();
	    ctx.lineWidth=SCALE*0.1;
	    ctx.strokeStyle = 'black';
      	ctx.stroke();
	    ctx.closePath();
	};
}