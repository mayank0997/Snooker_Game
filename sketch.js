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

var scale;

var canvasWidth, canvasHeight;

let baulkLineX;

// Global variables for cue movement simulation
var cueBackDistance = 20; // Distance to move cue back
var cueHitDistance = 0; // Distance cue moves forward when hitting
var cueHitSpeed = 10; // Speed of the cue hit
var isCueHitting = false; // Flag to check if cue is hitting
var cueStartX, cueStartY;
var isCuePulledBack = false;
var cueAnimationSpeed = 5;
var isCuePullingBack = false;

const ROTATION_STEP = 0.1; // The angle in radians for each step


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

    // Define starting position for the cue ball
    let cueBallStartX = cueLength * 1.55;
    let cueBallStartY = canvasHeight / 2;

    cueBall = new CueBall(cueBallStartX, cueBallStartY, ballDiameter);

    cue = new Cue(20 * scale, canvasHeight / 2, cueLength, 0);
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

                // Check if the cue ball falls into a pocket
                if (ball === cueBall.body) {
                    // Reset cue ball position
                    Body.setPosition(cueBall.body, { x: cueBallStartX, y: cueBallStartY });
                    Body.setVelocity(cueBall.body, { x: 0, y: 0 }); // Reset velocity
                } else {
                    // Remove other balls
                    World.remove(world, ball);
                    balls = balls.filter(b => b.body !== ball);
                }
            }
        }
    });


    // Create reset button
    resetButton = createButton('Reset Game');
    resetButton.position(10, canvasHeight - 30); // Adjust the position as needed
    resetButton.mousePressed(resetGame);
}

function resetGame() {
    // Logic to reset the balls
    // You might call initializeBalls or similar function here
    balls.forEach(ball => World.remove(world, ball.body));
    balls = [];
    initializeBalls();

    World.remove(world, cueBall);
    // Define starting position for the cue ball
    let cueBallStartX = cueLength * 1.55;
    let cueBallStartY = canvasHeight / 2;

    // Create a new cue ball
    cueBall = new CueBall(cueBallStartX, cueBallStartY, ballDiameter);
    World.add(world, cueBall.body); // Add the new cue ball to the world
    // Reset score if needed
    score = 0;
}

function draw() {
    background(200);
    drawTable();
    cushions.forEach(cushion => cushion.draw());

    balls.forEach(ball => {
        constrainBall(ball);
        ball.draw();
        // Update ball positions in p5.js objects
        ball.x = ball.body.position.x;
        ball.y = ball.body.position.y;
    });

    constrainBall(cueBall);
    cueBall.draw();
    cueBall.x = cueBall.body.position.x;
    cueBall.y = cueBall.body.position.y;
    cue.draw();

    if (isCueHitting) {
        animateCueHit();
    }

    pockets.forEach(pocket => pocket.draw());

    Engine.update(engine);
}


// Function to constrain a ball within table bounds and apply damping
function constrainBall(ball) {
    // Define the overlap distance outside the cushions
    let cushionOverlap = 2 * scale;

    // Adjusted table boundaries
    let minX = canvasWidth / 2 - tableWidth / 2 + cushionOverlap;
    let maxX = canvasWidth / 2 + tableWidth / 2 - cushionOverlap;
    let minY = canvasHeight / 2 - tableHeight / 2 + cushionOverlap;
    let maxY = canvasHeight / 2 + tableHeight / 2 - cushionOverlap;

    // Constrain position
    let posX = constrain(ball.body.position.x, minX, maxX);
    let posY = constrain(ball.body.position.y, minY, maxY);
    Body.setPosition(ball.body, { x: posX, y: posY });

    // Apply damping to velocity
    let damping = 0.98; // Adjust this value as needed
    let velX = ball.body.velocity.x * damping;
    let velY = ball.body.velocity.y * damping;
    Body.setVelocity(ball.body, { x: velX, y: velY });
}

function windowResized() {
    // Store relative positions and states for balls and cue
    let storedBallStates = balls.map(ball => {
        return {
            relativeX: (ball.body.position.x - (canvasWidth / 2 - tableWidth / 2)) / tableWidth,
            relativeY: (ball.body.position.y - (canvasHeight / 2 - tableHeight / 2)) / tableHeight,
            color: ball.color // Assuming each ball has a color property
        };
    });

    let cueBallState = {
        relativeX: (cueBall.body.position.x - (canvasWidth / 2 - tableWidth / 2)) / tableWidth,
        relativeY: (cueBall.body.position.y - (canvasHeight / 2 - tableHeight / 2)) / tableHeight,
        color: cueBall.color // Assuming the cue ball has a color property
    };

    let cueState = {
        relativeX: (cue.body.position.x - (canvasWidth / 2 - tableWidth / 2)) / tableWidth,
        relativeY: (cue.body.position.y - (canvasHeight / 2 - tableHeight / 2)) / tableHeight,
        angle: cue.angle
    };

    // Remove existing elements
    removeAllGameElements();

    // Recalculate scale and dimensions
    resizeSketch();
    resizeCanvas(canvasWidth, canvasHeight);

    // Reinitialize game elements with stored states
    reinitializeGameElements(storedBallStates, cueBallState, cueState);

    // Redraw the table and other static elements
    drawTable();

    Engine.update(engine);
}

function removeAllGameElements() {
    // Remove existing balls, cue ball, cushions, and pockets
    balls.forEach(ball => World.remove(world, ball.body));

    World.remove(world, cueBall.body); // Remove the cue ball
    balls = []; // Clear the balls array
    cushions.forEach(cushion => World.remove(world, cushion.body));
    pockets.forEach(pocket => World.remove(world, pocket.body));
    //World.remove(world, cue);
}

function reinitializeGameElements(storedBallStates, cueBallState, cueState) {
    initializeBallsWithStoredStates(storedBallStates, cueBallState);
    initializeCueBall(cueBallState);
    initializeCue(cueState);
    //World.add(world, cue);
    cushions = [];
    createCushions();
    pockets = [];
    createPockets();
}

function initializeBallsWithStoredStates(storedStates, cueBallState) {
    storedStates.forEach(state => {
        let newX = (canvasWidth / 2 - tableWidth / 2) + state.relativeX * tableWidth;
        let newY = (canvasHeight / 2 - tableHeight / 2) + state.relativeY * tableHeight;

        // Recreate each ball
        let newBall = new Ball(newX, newY, ballDiameter, state.color);
        balls.push(newBall);

        // Add the new ball to the Matter.js world
        World.add(world, newBall.body);
    });

    // Recreate and reposition the cue ball
    console.log("cue ball state: " + cueBallState);
    let newCueBallX = (canvasWidth / 2 - tableWidth / 2) + cueBallState.relativeX * tableWidth;
    let newCueBallY = (canvasHeight / 2 - tableHeight / 2) + cueBallState.relativeY * tableHeight;
    cueBall = new Ball(newCueBallX, newCueBallY, ballDiameter, cueBallState.color); // Recreate cue ball
    World.add(world, cueBall.body); // Add the cue ball to the world
}

function initializeCueBall(state) {
    let newX = (canvasWidth / 2 - tableWidth / 2) + state.relativeX * tableWidth;
    let newY = (canvasHeight / 2 - tableHeight / 2) + state.relativeY * tableHeight;
    cueBall = new Ball(newX, newY, ballDiameter, state.color); // Recreate cue ball
    World.add(world, cueBall.body); // Add the cue ball to the world
}

function initializeCue(state) {
    let newX = (canvasWidth / 2 - tableWidth / 2) + state.relativeX * tableWidth;
    let newY = (canvasHeight / 2 - tableHeight / 2) + state.relativeY * tableHeight;
    // Adjust the length and angle of the cue based on the new scale
    cueLength = 58 * scale; // Recalculate cue length based on the new scale
    cue = new Cue(newX, newY, cueLength, state.angle); // Recreate cue with new length and position
}


/**
 * I used the scale factor to make sure the snooker table and its elements (balls, pockets, cue) are proportionally scaled to fit within the current window size while maintaining their aspect ratios.
 * I learned about the scale factor on this website: https://www.thetechedvocate.org/how-to-calculate-a-scale-factor-a-step-by-step-guide/
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
        cueBall.x = mouseX;
        cueBall.y = mouseY;
    }

    // Move the cue with the mouse
    if (isDraggingCue) {
        // Constrain the new position within the canvas boundaries
        let newX = constrain(mouseX, cue.length / 2, canvasWidth - cue.length / 2);
        let newY = constrain(mouseY, cue.length / 2, canvasHeight - cue.length / 2);
        cue.setPosition(newX, newY);
        Matter.Body.setPosition(cue.body, { x: newX, y: newY });
    }
}

function mouseReleased() {
    isDraggingCueBall = false;
    isDraggingCue = false;
}

function drawTable() {
    // Draw the main table area
    fill(0, 100, 0); // Dark green for the snooker table
    rectMode(CENTER);
    rect(canvasWidth / 2, canvasHeight / 2, tableWidth, tableHeight); // 20 for rounded corners

    // Draw table edges
    let edgeWidth = 10 * scale; // Adjust edge width as needed
    noFill();
    stroke('brown'); // Color of the table edge
    strokeWeight(edgeWidth);
    rect(canvasWidth / 2, canvasHeight / 2, tableWidth + edgeWidth, tableHeight + edgeWidth, 20);

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
    cushionThickness = 2.5 * scale;
    let horizontalCushionLength = (tableWidth - 2 * pocketSize) / 2; // Horizontal cushion length excluding pockets

    var pocketOffset = pocketSize / 2;

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

}


function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        cue.setAngle(cue.angle - ROTATION_STEP);
    } else if (keyCode === RIGHT_ARROW) {
        cue.setAngle(cue.angle + ROTATION_STEP);
    } else if (keyCode === 32) { // Space bar for hitting the ball
        if (!isCueHitting) {
            hitCueBall();
        }
    }
}


function hitCueBall() {
    isCueHitting = true;
    isCuePullingBack = true; // Setting this flag to true to start the pullback process
    cuePullBackDistance = 20 * scale; // Adjust the pull-back distance
    cuePushForwardDistance = 20 * scale; // Adjust the push-forward distance
    cueOriginalPosition = createVector(cue.x, cue.y); // Store original position
}

function animateCueHit() {
    if (isCuePullingBack) {
        if (cuePullBackDistance > 0) {
            let moveX = -cueAnimationSpeed * cos(cue.angle);
            let moveY = -cueAnimationSpeed * sin(cue.angle);
            cue.setPosition(cue.x + moveX, cue.y + moveY);
            cuePullBackDistance -= cueAnimationSpeed;
        } else {
            isCuePullingBack = false;
            cuePushForwardDistance = cuePullBackDistance + 10 * scale;
        }
    } else if (cuePushForwardDistance > 0) {
        let moveX = cueAnimationSpeed * cos(cue.angle);
        let moveY = cueAnimationSpeed * sin(cue.angle);
        cue.setPosition(cue.x + moveX, cue.y + moveY);
        cuePushForwardDistance -= cueAnimationSpeed;

        let cueTipX = cue.x + cos(cue.angle) * cue.length / 2;
        let cueTipY = cue.y + sin(cue.angle) * cue.length / 2;

        let distance = dist(cueTipX, cueTipY, cueBall.body.position.x, cueBall.body.position.y);
        console.log("Distance to cue ball from tip:", distance);
        if (distance < 18 * scale) {
            let forceDirection = p5.Vector.fromAngle(cue.angle);
            let forceMagnitude = 0.004;
            let force = forceDirection.mult(forceMagnitude);
            console.log("force being applied");
            Body.applyForce(cueBall.body, cueBall.body.position, force);
            isCueHitting = false;
            cue.setPosition(cueOriginalPosition.x, cueOriginalPosition.y);
        }
    } else if (!isCuePullingBack && cuePushForwardDistance <= 0 && isCueHitting) {
        isCueHitting = false;
        cue.setPosition(cueOriginalPosition.x, cueOriginalPosition.y);
    }
}
