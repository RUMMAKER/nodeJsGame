var canvas = document.getElementById("gameCanvas");
var callbacks = [];
function addToCallbacks(orig,callback) {
	if(callbacks.length == 0) {
		callbacks.push(callback);
		return;
	}
	// upgrade to binary search later
	var i = -1;
	for(var k = 0; k < callbacks.length; k++) {
		if(callback.angle > callbacks[k].angle) {
			i = k;
		}
	}
	if(i == -1) {
		callbacks.splice(0, 0, callback);
	} else {
		if(i >= callbacks.length-1) {
			callbacks.push(callback);
		} else {
			callbacks.splice(i+1, 0, callback);
		}
	}
	/*
	//if(vec2dist(callbacks[i].point, callback.point)<0.5) {
		//too close, dont add
	//} else {
		//add callback to callbacks at index i
		if(i >= callbacks.length-1) {
			callbacks.push(callback);
		} else {
			callbacks.splice(i+1, 0, callback);
		}
	//}
	*/
}

var RaycastCallback = function() {
    this.hit = false;
    this.previousFraction = 1;
};
RaycastCallback.prototype.ReportFixture = function(fixture,point,normal,fraction) {
    //if ( ... not interested in this fixture ... ) 
    //    return -1;
    this.hit = true;
    if(fraction <= this.previousFraction) {
    	this.point = point;
    	this.normal = normal;
    	this.previousFraction = fraction;
    }
    return this.previousFraction;
};

function raycastFromPoint(center,blockList) {
	callbacks.length = 0; // empty prev points
	cornerCasts(center);
	for(var i = 0; i < blockList.length; i++) {
		var points = blockList[i].points;
		for(var k = 0; k < points.length; k++) {
			if(vec2dist(center, points[k]) < 1.42*bigger(canvas.width, canvas.height)) {
				var callback = castRay(center, points[k], 1.42*bigger(canvas.width, canvas.height));
				if(!callback.hit){
					continue;
				}
				var dir = getPerpendicularVec(callback.point.x-center.x, callback.point.y-center.y);
				dir.x*=0.2;
				dir.y*=0.2;
				var callback2 = castRay(center, new b2Vec2(callback.point.x+dir.x, callback.point.y+dir.y), 1.42*bigger(canvas.width, canvas.height));
				var callback3 = castRay(center, new b2Vec2(callback.point.x-dir.x, callback.point.y-dir.y), 1.42*bigger(canvas.width, canvas.height));
				addToCallbacks(center, callback);
				addToCallbacks(center, callback2);
				addToCallbacks(center, callback3);
			}
		}
	}
	debugPolygon();
}

function getPerpendicularVec(x,y) {
	var dir = new b2Vec2(x, y);
	dir.Normalize();
	var dirX = dir.x;
	dir.x = -dir.y;
	dir.y = dirX;
	return dir;
}

function castRay(orig,dest,maxDist) {
	var line = new b2Vec2(dest.x-orig.x, dest.y-orig.y);
	line.Normalize();
	line.x *= maxDist;
	line.y *= maxDist;
	line.x += orig.x;
	line.y += orig.y;
	var callback = new RaycastCallback();
	WORLD.RayCast(callback, orig, line);
	if(!callback.hit){
		callback.point = line;
	}
	callback.angle = calcAngle(orig, callback.point);
	return callback;
}

function debugPolygon() {
	if(callbacks.length < 3){
		return;
	}
	ctx.strokeStyle = 'green';
    ctx.lineWidth=0.1*SCALE;
	for(var i = 0; i < callbacks.length-1; i++) {
		ctx.beginPath();
		ctx.moveTo(callbacks[i].point.x*SCALE,callbacks[i].point.y*SCALE);
		ctx.lineTo(callbacks[i+1].point.x*SCALE,callbacks[i+1].point.y*SCALE);
		ctx.stroke();
		ctx.closePath();
	}
	ctx.beginPath();
	ctx.moveTo(callbacks[callbacks.length-1].point.x*SCALE,callbacks[callbacks.length-1].point.y*SCALE);
	ctx.lineTo(callbacks[0].point.x*SCALE,callbacks[0].point.y*SCALE);
	ctx.stroke();
	ctx.closePath();

	ctx.fillStyle="blue";
	ctx.globalAlpha = 0.3;
	ctx.beginPath();
	ctx.moveTo(callbacks[0].point.x*SCALE,callbacks[0].point.y*SCALE);
	for(var i = 1; i < callbacks.length; i++) {
		ctx.lineTo(callbacks[i].point.x*SCALE,callbacks[i].point.y*SCALE);
	}
	ctx.closePath();
	ctx.fill();
	ctx.globalAlpha = 1;
}

function bigger(a,b) {
	if(a>b){
		return a;
	}
	return b;
}

function cornerCasts(center) {
	var len = 1.42*bigger(canvas.width, canvas.height);
	var callback1 = cornerHelper(center, len, len, ctx);
	var callback2 = cornerHelper(center, len, -len, ctx);
	var callback3 = cornerHelper(center, -len, len, ctx);
	var callback4 = cornerHelper(center, -len, -len, ctx);
	addToCallbacks(center, callback1);
	addToCallbacks(center, callback2);
	addToCallbacks(center, callback3);
	addToCallbacks(center, callback4);
}

function cornerHelper(center, xOffset, yOffset) {
	return castRay(center, new b2Vec2(center.x+xOffset, center.y+yOffset), Math.abs(xOffset));
}

function vec2dist(v1, v2) {
	return Math.sqrt( (v2.x-v1.x)*(v2.x-v1.x) + (v2.y-v1.y)*(v2.y-v1.y) );
}

///////////////
//return a angle between 0 and 359
function normalizeAngle(angle)
{
	while(angle < 0) {
		angle += 360;
	}
	while(angle >= 360){
		angle -= 360;
	}
	return angle;
}

//calculates the angle of a line given transform.position and end point
function calcAngle(orig,end)
{
	return normalizeAngle(Math.atan2(end.y-orig.y, end.x-orig.x)*180/Math.PI);
}
/*
//return true if angle a is between angle start and end (counter-clockwise from start to end)
bool isBetween(float start, float end, float a)
{
	float barriar = 360f;
	float barriar2 = 0f;
	if (start < end)//end not cross barriar
		return (a > start && a < end);
	else//end crosses barriar
		return (a > start && a <= barriar) || (a >= barriar2 && a < end);
}
*/
function convertToPoint(orig,angle)
{
	return new b2Vec2(angle.x+Math.cos(Math.PI/180 * angle), angle.y+Math.sin(Math.PI/180 * angle));
}