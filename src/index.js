import * as dat from 'dat.gui';
import {Engine,Events,Render,Runner,
        Body,Composite,Composites,Constraint,
        MouseConstraint,Mouse,World,Bodies,Vector} from 'matter-js';

const gui = new dat.GUI();

// create engine
var engine = Engine.create(),
  world = engine.world;

// create renderer
var render = Render.create({
  element: document.getElementById('app'),
  engine: engine,
  options: {
    wireframes: false,
    background: 'red',
    showAngleIndicator: true
  }
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);


let options = {
  width: 800,
  wheels_x:600,
  wheels_y:600,
  wheelL_radius: 150,
  wheelR_radius: 100,
  wheels_separation: 300,
  arms_padding: 10,
  arms_joint: 0.5,
  armL_length: 500,
  armR_length: 300,
  arms_width: 20,
  speedL: 0.1,
  speedR: 0.1,
  trail_length: 200,
  trail_width: 5,
};


// add bodies
const group = Body.nextGroup(true)
const wheelL = Bodies.circle(options.wheels_x-options.wheels_separation/2, options.wheels_y, options.wheelL_radius, { collisionFilter: { group: group }});
const wheelR = Bodies.circle(options.wheels_x+options.wheels_separation/2, options.wheels_y, options.wheelR_radius, { collisionFilter: { group: group }});
const armR = Bodies.rectangle(0, 0, options.armR_length, options.arms_width, { collisionFilter: { group: group } });
const armL = Bodies.rectangle(0, 0, options.armL_length, options.arms_width, { collisionFilter: { group: group } });
const marker = Bodies.circle(0, 0, options.arms_width, { collisionFilter: { group: group } });

const wheelLC = Constraint.create({
    bodyA: wheelL,
    pointB: Vector.clone(wheelL.position),
    length: 0,
})
const wheelRC = Constraint.create({
    bodyA: wheelR,
    pointB: Vector.clone(wheelR.position),
    length: 0,
})
const armWheelLC = Constraint.create({
    bodyA: armL,
    pointA: { x: options.armL_length/2-options.arms_padding, y: 0 },
    bodyB: wheelL,
    pointB: { x: 110, y: 0 },
    length: 0,
})
const armWheelRC = Constraint.create({
    bodyA: armR,
    pointA: { x: options.armR_length/2-options.arms_padding, y: 0 },
    bodyB: wheelR,
    pointB: { x: 90, y: 0 },
    length: 0,
    stiffness: 1
})
const armMarkerC = Constraint.create({
    bodyA: armL,
    pointA: { x: -(options.armL_length/2-options.arms_padding), y: 0 },
    bodyB: marker,
    pointB: { x: 0, y: 0 },
    length: 0,
    stiffness: 1
})
const armArmC = Constraint.create({
    bodyA: armR,
    pointA: { x: -(options.armR_length/2-options.arms_padding), y: 0 },
    bodyB: armL,
    pointB: { x: -90, y: 0 },
    length: 0,
    stiffness: 1
})







Events.on(engine, 'beforeUpdate', function(event) {

  wheelL.position.x = options.wheels_separation/2
  wheelLC.pointB = Vector.clone(wheelL.position)
  armWheelLC.bodyB = wheelL

  Body.rotate(wheelL,options.speedL)
  Body.rotate(wheelR,options.speedR)

});


World.add(world, [
  wheelL,
  wheelR,
  armR,
  armL,
  marker,
  wheelLC,
  wheelRC,
  armWheelLC,
  armWheelRC,
  armMarkerC,
  armArmC,

]);


let trail = [];

Events.on(render, 'afterRender', function() {
  trail.unshift({
    position: Vector.clone(marker.position),
    speed: marker.speed
  });

  Render.startViewTransform(render);
  render.context.globalAlpha = 0.7;

  for (var i = 0; i < trail.length; i += 1) {
    var point = trail[i].position,
      speed = trail[i].speed;

    var hue = 250 + Math.round((1 - Math.min(1, speed / 10)) * 170);
    render.context.fillStyle = 'hsl(' + hue + ', 100%, 55%)';

    //draw a circle
    render.context.beginPath();
    render.context.arc(point.x, point.y, options.trail_width, 0, Math.PI*2, true);
    render.context.closePath();
    render.context.fill();

    //render.context.fillRect(point.x, point.y, options.trail_width, options.trail_width);
  }

  render.context.globalAlpha = 1;
  Render.endViewTransform(render);

  while (trail.length > options.trail_length) {
    trail.pop();
  }
});



// fit the render viewport to the scene
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 1200, y: 800 }
});


world.gravity.y = 0;




gui.add(options, 'wheels_separation', 200, 400);
gui.add(options, 'speedL',0.01,1.0);
gui.add(options, 'speedR',0.01,1.0);
gui.add(options, 'trail_length',20,2000);
gui.add(options, 'trail_width',1,40);
