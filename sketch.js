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

var baulkLineX;

var cueInitialX;
var cueInitialY;

// Global variables for cue movement simulation
var isCueHitting = false; // Flag to check if cue is hitting
var cueStartX, cueStartY;
var cueAnimationSpeed = 5;
var isCuePullingBack = false;

const ROTATION_STEP = 0.1; // The angle in radians for each step

var resetButton;

var score;
var promptMessage;

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
    var cueBallStartX = cueLength * 1.55;
    var cueBallStartY = canvasHeight / 2;

    cueBall = new CueBall(cueBallStartX, cueBallStartY, ballDiameter);

    cushions = [];
    createCushions();
    pockets = [];
    createPockets();

    cueInitialX = 20 * scale;
    cueInitialY = canvasHeight / 2;
    cue = new Cue(20 * scale, canvasHeight / 2, cueLength, 0);
    cue.draw();

    score = 0; // Keep track of the score
    promptMessage = "PROMPT"; // Message to display for impact type

    Events.on(engine, 'collisionStart', function (event) {
        var pairs = event.pairs;

        for (var i = 0; i < pairs.length; i++) {
            var bodyA = pairs[i].bodyA;
            var bodyB = pairs[i].bodyB;

            // Check if either of the bodies is a pocket
            if (bodyA.isSensor || bodyB.isSensor) {
                var ball;
                // Determine which one is the ball and which one is the pocket
                if (bodyA.isSensor) {
                    ball = bodyB;
                } else {
                    ball = bodyA;
                }

                // Check if the cue ball falls into a pocket
                if (ball === cueBall.body) {
                    // Reset cue ball position
                    Body.setPosition(cueBall.body, { x: cueBallStartX, y: cueBallStartY });
                    Body.setVelocity(cueBall.body, { x: 0, y: 0 }); // Reset velocity
                    score--;
                } else {
                    // Remove other balls
                    World.remove(world, ball);
                    balls = balls.filter(b => b.body !== ball);
                    score++;
                }
            }
        }
    });

    if (resetButton) {
        resetButton.remove();
    }

    // Create reset button
    resetButton = createButton('Reset Game');
    resetButton.position(10, canvasHeight - 30); // Adjust the position as needed
    resetButton.mousePressed(resetGame);
}

function resetGame() {
    setup();
}


function draw() {
    background(200);

    // Display Instructions
    fill(0); // Black text
    textSize(getTextSize());
    textAlign(LEFT, TOP);
    textWrap(WORD);
    text("Instructions: Use arrow keys to adjust cue angle, space to hit", canvasWidth / 10, canvasHeight / 30, canvasWidth / 6);

    // Display Score
    textAlign(RIGHT, TOP);
    text("Score: " + score, canvasWidth - 30, 20);

    // Display Prompt Message below the table
    textAlign(CENTER, BOTTOM);
    text(promptMessage, canvasWidth / 2, canvasHeight - 10);

    drawTable();
    cushions.forEach(cushion => cushion.draw());
    pockets.forEach(pocket => pocket.draw());

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

    Engine.update(engine);
}


function windowResized() {
    if (resetButton) {
        resetButton.remove();
    }
    setup();
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
        var newX = constrain(mouseX, cue.length / 2, canvasWidth - cue.length / 2);
        var newY = constrain(mouseY, cue.length / 2, canvasHeight - cue.length / 2);
        cue.setPosition(newX, newY);
        Matter.Body.setPosition(cue.body, { x: newX, y: newY });
    }
}

function mouseReleased() {
    isDraggingCueBall = false;
    isDraggingCue = false;
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


