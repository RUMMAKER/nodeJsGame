GameObject.prototype.radius = rad;
// Super class of all objects
function GameObject(startX, startY, rad, objectId) {
	this.pos = {x: startX, y: startY};
	this.id = objectId;
	var WIDTH = require("./GameVars").WIDTH;
	var HEIGHT = require("./GameVars").HEIGHT;

	this.keepInBound = function() {
		if(this.pos.x > WIDTH-GameObject.prototype.radius){
			this.pos.x = WIDTH-GameObject.prototype.radius;
		} else if (this.pos.x < GameObject.prototype.radius) {
			this.pos.x = GameObject.prototype.radius;
		}
		if(this.pos.y > HEIGHT-GameObject.prototype.radius){
			this.pos.y = HEIGHT-GameObject.prototype.radius;
		} else if (this.pos.y < GameObject.prototype.radius) {
			this.pos.y = GameObject.prototype.radius;
		}
	}
}
module.exports = GameObject;