var GameObject = require("./GameObject");
var GameVars = require("./GameVars");
var Box2D = require("box2dweb");
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
function PhysicsBody (objectId, bodyDef, fixtureDef) {
	GameObject.call(this, objectId);
    this.bodyDef = new b2BodyDef();
    for (var i in bodyDef) {
        this.bodyDef[i] = bodyDef[i];
    }
    this.body = GameVars.WORLD.CreateBody(this.bodyDef);
    this.fixtureDef = new b2FixtureDef();
    for (var i in fixtureDef) {
        this.fixtureDef[i] = fixtureDef[i];
    }
    this.body.CreateFixture(this.fixtureDef);
};
PhysicsBody.prototype = Object.create(GameObject.prototype);
module.exports = PhysicsBody;