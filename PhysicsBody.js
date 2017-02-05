var Box2D = require("box2dweb");
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var GameObject = require("./GameObject");

function Body (objectId, world, details, scale) {
	GameObject.call(this, objectId);

    this.details = details = details || {};
    this.scale = scale;
    // Create the definition
    this.definition = new b2BodyDef();

    // Set up the definition
    for (var k in this.definitionDefaults) {
        this.definition[k] = details[k] || this.definitionDefaults[k];
    }
    this.definition.position = new b2Vec2(details.x || 0, details.y || 0);
    this.definition.linearVelocity = new b2Vec2(details.vx || 0, details.vy || 0);
    this.definition.userData = this;
    this.definition.type = details.type == "static" ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;

    // Create the Body
    this.body = world.CreateBody(this.definition);

    // Create the fixture
    this.fixtureDef = new b2FixtureDef();
    for (var l in this.fixtureDefaults) {
        this.fixtureDef[l] = details[l] || this.fixtureDefaults[l];
    }


    details.shape = details.shape || this.defaults.shape;

    switch (details.shape) {
        case "circle":
            details.radius = details.radius || this.defaults.radius;
            this.fixtureDef.shape = new b2CircleShape(details.radius);
            break;
        case "polygon":
            this.fixtureDef.shape = new b2PolygonShape();
            this.fixtureDef.shape.SetAsArray(details.points, details.points.length);
            break;
        case "block":
        default:
            details.width = details.width || this.defaults.width;
            details.height = details.height || this.defaults.height;

            this.fixtureDef.shape = new b2PolygonShape();
            this.fixtureDef.shape.SetAsBox(details.width / 2,
            details.height / 2);
            break;
    }

    this.body.CreateFixture(this.fixtureDef);
};

Body.prototype = Object.create(GameObject.prototype);

Body.prototype.scale = 1;

Body.prototype.defaults = {
    shape: "block",
    width: 5,
    height: 5,
    radius: 2.5
};

Body.prototype.fixtureDefaults = {
    density: 2,
    friction: 1,
    restitution: 0.2
};

Body.prototype.definitionDefaults = {
    active: true,
    allowSleep: true,
    angle: 0,
    angularVelocity: 0,
    awake: true,
    bullet: false,
    fixedRotation: true
};

//Body.prototype.constructor = Body;

module.exports = Body;