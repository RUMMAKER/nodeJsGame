function Block(x, y, width, height) {
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	this.draw = function(ctx, m) {
		ctx.beginPath();
		ctx.rect(this.x*SCALE,this.y*SCALE, this.width*SCALE,this.height*SCALE);
	    ctx.fillStyle = 'black';
	    ctx.fill();
	    ctx.lineWidth=SCALE*0.2;
	    ctx.strokeStyle = 'black';
	    if(m){
	    	ctx.strokeStyle = '#898989';
	    }
      	ctx.stroke();
	    ctx.closePath();
	};

	// create block in world (to be used for raycasting)
	var shape = new b2PolygonShape();
	shape.SetAsBox(width/2, height/2);

	var bodyDef = {userData: this, linearVelocity: new b2Vec2(0,0), type: b2Body.b2_staticBody, position: new b2Vec2(x + width/2, y + height/2), active: true, allowSleep: true, angle: 0, angularVelocity: 0, awake: true, bullet: false, fixedRotation: true};
	this.bodyDef = new b2BodyDef();
    for (var i in bodyDef) {
        this.bodyDef[i] = bodyDef[i];
    }
    this.body = WORLD.CreateBody(this.bodyDef);

    var fixtureDef = {shape: shape, density: 1, friction: 0.1, restitution: 0.1};
    this.fixtureDef = new b2FixtureDef();
    for (var i in fixtureDef) {
        this.fixtureDef[i] = fixtureDef[i];
    }
    this.body.CreateFixture(this.fixtureDef);

    this.points = [ new b2Vec2(this.x, this.y),
					new b2Vec2(this.x+this.width, this.y),
					new b2Vec2(this.x, this.y+this.height),
					new b2Vec2(this.x+this.width, this.y+this.height)
				];
}

Block.prototype.points = [];