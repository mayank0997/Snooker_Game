//global variables 

//matter.js 
var Engine = Matter.Engine;
//var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Events = Matter.Events;

var engine, world;

var tableWidth, tableHeight;
var ballDiameter, pocketSize;
var cushions;

var balls;
var cueBall;
var pockets;

var cue;
var cueLength;

var isDraggingCueBall = false;
var isDraggingCue = false;

/**
 * I used the scale factor to make sure the snooker table and its elements (balls, pockets, cue) are proportionally scaled to fit within the current window size while maintaining their aspect ratios.
 * I learned about the scale factor on this website: https://www.thetechedvocate.org/how-to-calculate-a-scale-factor-a-step-by-step-guide/
 */
var scale;

var canvasWidth, canvasHeight;

let baulkLineX;

// Global variables for cue movement simulation
var cueBackDistance = 20; // Distance to move cue back
var cueHitDistance = 0; // Distance cue moves forward when hitting
var cueHitSpeed = 10; // Speed of the cue hit
var isCueHitting = false; // Flag to check if cue is hitting

function setup() {
    resizeSketch();
    createCanvas(canvasWidth, canvasHeight);
    engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 0;
    world = engine.world;
    drawTable();
    balls = [];
    initializeBalls();

    cueBall = new CueBall(cueLength * 1.55, canvasHeight / 2, ballDiameter);

    cue = new Cue(20, canvasHeight / 2, cueLength, 0);
    cue.draw();
    cushions = [];
    createCushions();
    pockets = [];
    createPockets();
    Events.on(engine, 'collisionStart', function (event) {
        let pairs = event.pairs;

        for (let i = 0; i < pairs.length; i++) {
            let bodyA = pairs[i].bodyA;
            let bodyB = pairs[i].bodyB;

            // Check if either of the bodies is a pocket
            if (bodyA.isSensor || bodyB.isSensor) {
                // Determine which one is the ball and which one is the pocket
                let ball = bodyA.isSensor ? bodyB : bodyA;

                // Remove the ball
                World.remove(world, ball);
                balls = balls.filter(b => b.body !== ball);
            }
        }
    });

}

function draw() {
    background(200); // Table background color
    drawTable();
    balls.forEach(ball => ball.draw());

    createCushions();
    cushions.forEach(cushion => cushion.draw());

    cueBall.draw();
    cue.draw();

    if (isCueHitting) {
        animateCueHit(); // Call animateCueHit function to handle cue movement
    }

    for (let pocket of pockets) {
        pocket.draw();
    }

    handleCollisions(); // Handle collisions between balls
    Engine.update(engine); // Update physics engine
}

/*
function windowResized() {
    // Store the old relative position
    let relativeX = (cueBall.body.position.x - canvasWidth / 2) / tableWidth;
    let relativeY = (cueBall.body.position.y - canvasHeight / 2) / tableHeight;

    resizeSketch();
    resizeCanvas(canvasWidth, canvasHeight);

    // Reinitialize cushions, balls, and cue
    cushions = [];
    createCushions();
    balls = [];
    initializeBalls();

    // Calculate the new position
    let newCueBallX = canvasWidth / 2 + relativeX * tableWidth;
    let newCueBallY = canvasHeight / 2 + relativeY * tableHeight;
    Body.setPosition(cueBall.body, { x: newCueBallX, y: newCueBallY });

    cue = new Cue(20, canvasHeight / 2, cueLength, 0);
}
*/

function resizeSketch() {
    /**
     * windowWidth / (144 + 58 * 2): This part calculates a scaling factor based on the width of the browser window (windowWidth). The denominator (144 + 58 * 2) represents the full length of the snooker table (144 inches/12 ft) plus two and a half times the length of the cue (58 inches) on either side. This calculation determines how much the full-size table and cue should be scaled down to fit the window width.
     * windowHeight / (72 + 58 * 2): Similarly, this calculates a scaling factor based on the height of the browser window (windowHeight). Here, 72 inches (6 ft) is half the length of the snooker table, accounting for the 2:1 aspect ratio of a standard table, and again 58 inches is the cue length, considered on both top and bottom of the table.
     * I chose the smaller of these two scale factors because it ensures that the entire table and cues will fit within the viewport, irrespective of whether the limiting dimension is width or height.
     */
    scale = min(windowWidth / (144 + 58 * 2.5), windowHeight / (72 + 58 * 2.5));

    tableWidth = 144 * scale; // Full-size table width scaled down
    tableHeight = 72 * scale; // Full-size table height scaled down

    ballDiameter = tableWidth / 36;
    pocketSize = ballDiameter * 1.5;

    // Scaled cue length (same scale factor)
    cueLength = 58 * scale;

    // Adjust canvas size 
    canvasWidth = tableWidth + cueLength * 2.5; // 1.25 times cue length as buffer on each side
    canvasHeight = tableHeight + cueLength * 2.5; // 1.25 times cue length as buffer on top and bottom
}

function mousePressed() {
    // Check if the mouse is over the cue ball
    if (dist(mouseX, mouseY, cueBall.body.position.x, cueBall.body.position.y) < cueBall.diameter / 2) {
        isDraggingCueBall = true;
    }
    // Check if the mouse is close to the cue (anywhere on the cue, not just the end)
    else if (dist(mouseX, mouseY, cue.body.position.x, cue.body.position.y) < cue.length / 2) {
        isDraggingCue = true;
    }
}


function mouseDragged() {
    // Move the cue ball with the mouse
    if (isDraggingCueBall) {
        Matter.Body.setPosition(cueBall.body, { x: mouseX, y: mouseY });
    }

    // Move the cue with the mouse
    if (isDraggingCue) {
        cue.setPosition(mouseX, mouseY);
    }
}

function mouseReleased() {
    isDraggingCueBall = false;
    isDraggingCue = false;
}

function drawTable() {
    // Set the fill color for the table
    fill(0, 100, 0); // Dark green for the snooker table

    // Draw the table as a rectangle with rounded corners
    rectMode(CENTER);
    rect(canvasWidth / 2, canvasHeight / 2, tableWidth, tableHeight, 20); // 20 is the radius for rounded corners

    // Draw the pockets
    fill(0); // Black for the pockets
    ellipseMode(CENTER);

    // Calculate the x-coordinate of the baulk line
    baulkLineX = (canvasWidth / 2) - (tableWidth / 2) + (29 * scale);

    // Draw the baulk line
    stroke(255); // White line for baulk line
    strokeWeight(2);
    line(baulkLineX, canvasHeight / 2 - tableHeight / 2, baulkLineX, canvasHeight / 2 + tableHeight / 2);

    // Draw the D-shaped semi-circle on the baulk line
    var dRad = 11.5 * scale; //11.5 in radius scaled
    noFill();
    arc(baulkLineX, canvasHeight / 2, dRad * 2, dRad * 2, HALF_PI, -HALF_PI);

    noStroke(); // Reset stroke settings
}

function createPockets() {
    // Pocket positions (corners and midpoints of longer sides)
    var pocketPositions = [
        { x: canvasWidth / 2 - tableWidth / 2, y: canvasHeight / 2 - tableHeight / 2 },
        { x: canvasWidth / 2 + tableWidth / 2, y: canvasHeight / 2 - tableHeight / 2 },
        { x: canvasWidth / 2 - tableWidth / 2, y: canvasHeight / 2 + tableHeight / 2 },
        { x: canvasWidth / 2 + tableWidth / 2, y: canvasHeight / 2 + tableHeight / 2 },
        { x: canvasWidth / 2, y: canvasHeight / 2 - tableHeight / 2 },
        { x: canvasWidth / 2, y: canvasHeight / 2 + tableHeight / 2 }
    ];

    for (let pos of pocketPositions) {
        pockets.push(new Pocket(pos.x, pos.y, pocketSize));
    }
}

function initializeBalls() {
    // Initialize and create each ball
    var initBallX = canvasWidth / 2 + tableWidth / 5;
    var initBallY = canvasHeight / 2; // Center of the table height-wise
    balls.push(new Ball(initBallX, initBallY, ballDiameter, 'pink'));
    balls.push(new Ball(baulkLineX, initBallY + 11.5 * scale, ballDiameter, 'yellow'))

    balls.push(new Ball(baulkLineX, initBallY - 11.5 * scale, ballDiameter, 'green'));
    balls.push(new Ball(baulkLineX, initBallY, ballDiameter, 'brown'));

    // Blue ball at the center of the table
    balls.push(new Ball(canvasWidth / 2, canvasHeight / 2, ballDiameter, 'blue'));

    let redsTriangleStartX = canvasWidth / 2 + tableWidth / 4.3;
    let redsTriangleStartY = canvasHeight / 2;
    let rowLength = 5;
    for (let row = 0; row < rowLength; row++) {
        for (let col = 0; col <= row; col++) {
            let x = redsTriangleStartX + row * ballDiameter;
            let y = redsTriangleStartY + row * ballDiameter / 2 - col * ballDiameter;
            balls.push(new Ball(x, y, ballDiameter, 'red'));
        }
    }

    let blackBallX = redsTriangleStartX + 7 * ballDiameter;
    balls.push(new Ball(blackBallX, redsTriangleStartY, ballDiameter, 'black'));
}

function createCushions() {
    cushionThickness = 4 * scale;
    let horizontalCushionLength = (tableWidth - 3 * pocketSize) / 2; // Horizontal cushion length excluding pockets

    var pocketOffset = pocketSize / 1.5;

    // Clear existing cushions
    cushions.forEach(cushion => World.remove(world, cushion.body));
    cushions = [];

    // Top and Bottom Cushions (split into two segments each)
    cushions.push(new Cushion(canvasWidth / 2 - horizontalCushionLength / 2 - pocketOffset, canvasHeight / 2 - tableHeight / 2, horizontalCushionLength, cushionThickness));
    cushions.push(new Cushion(canvasWidth / 2 + horizontalCushionLength / 2 + pocketOffset, canvasHeight / 2 - tableHeight / 2, horizontalCushionLength, cushionThickness));
    cushions.push(new Cushion(canvasWidth / 2 - horizontalCushionLength / 2 - pocketOffset, canvasHeight / 2 + tableHeight / 2, horizontalCushionLength, cushionThickness));
    cushions.push(new Cushion(canvasWidth / 2 + horizontalCushionLength / 2 + pocketOffset, canvasHeight / 2 + tableHeight / 2, horizontalCushionLength, cushionThickness));

    // Left and Right Cushions (continuous)
    let leftCushionX = canvasWidth / 2 - tableWidth / 2;
    let rightCushionX = canvasWidth / 2 + tableWidth / 2;
    cushions.push(new Cushion(leftCushionX, canvasHeight / 2, cushionThickness, tableHeight));
    cushions.push(new Cushion(rightCushionX, canvasHeight / 2, cushionThickness, tableHeight));

    // Add all cushions to the world
    //cushions.forEach(cushion => World.add(world, cushion.body));
}


// function updateCue() {
//     let cueEndX = cue.position.x + cue.length * cos(cue.angle);
//     let cueEndY = cue.position.y + cue.length * sin(cue.angle);
//     let mouseAngle = atan2(mouseY - cueEndY, mouseX - cueEndX);
//     cue.angle = mouseAngle;
// }

function keyPressed() {
    if (keyCode === 32) { // Space bar
        hitCueBall();
    }
}

function hitCueBall() {
    let cueBallPos = cueBall.body.position;
    let cuePos = cue.body.position;
    let distance = dist(cueBallPos.x, cueBallPos.y, cuePos.x, cuePos.y);

    if (distance < 50 * scale) { // Adjust this distance as needed
        isCueHitting = true;
        cueHitDistance = cueBackDistance;
    }
}


function animateCueHit() {
    if (cueHitDistance > 0) {
        // Move the cue backward
        cue.setPosition(cue.x, cue.y - cueHitSpeed);
        cueHitDistance -= cueHitSpeed;
    } else {
        // Move cue forward and apply force to the cue ball
        let forceDirection = p5.Vector.fromAngle(cue.angle);
        let forceMagnitude = 0.02; // Adjust as needed
        let force = forceDirection.mult(forceMagnitude);
        Body.applyForce(cueBall.body, cueBall.body.position, force);

        // Reset the cue position after hitting
        cue.resetPosition();
        isCueHitting = false;
    }
}



function applyForceToCueBall() {
    let forceMagnitude = 0.02 * cueLength; // Adjust force as needed
    let forceDirection = p5.Vector.fromAngle(cue.angle);
    let force = forceDirection.mult(forceMagnitude);
    Body.applyForce(cueBall.body, cueBall.body.position, force);
}


function handleCollisions() {
    // Handle collisions and update game state
}
