
//global variables 
var tableWidth, tableHeight;
var ballDiameter, pocketSize;

class Ball {
    constructor(x, y, diameter, color) {
        this.x = x;
        this.y = y;
        this.diameter = diameter;
        this.color = color;
        this.body = Matter.Bodies.circle(x, y, diameter / 2, { restitution: 0.9 });
        // Add body to Matter.World in sketch.js
        Matter.World.add(world, this.body);
    }

    draw() {
        fill(this.color);
        ellipse(this.body.position.x, this.body.position.y, this.diameter, this.diameter);
    }
}
var balls = [];
var cueBall;

class Cue {
    constructor(x, y, length, angle) {
        this.position = createVector(x, y);
        this.length = length;
        this.angle = angle;
        // Additional properties as needed
    }

    draw() {
        push();
        stroke(139, 69, 19);
        fill(0);
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        line(0, 0, this.length, 0); // Drawing the cue as a line
        pop();
    }

    // Add method to apply force to the cue ball
}

var cue;
var cueLength;

//matter.js 
var engine, world;

/**
 * I used the scale factor to make sure the snooker table and its elements (balls, pockets, cue) are proportionally scaled to fit within the current window size while maintaining their aspect ratios.
 * I learned about the scale factor on this website: https://www.thetechedvocate.org/how-to-calculate-a-scale-factor-a-step-by-step-guide/
 */
var scale;

var canvasWidth, canvasHeight;

let baulkLineX;

function setup() {
    resizeSketch();
    createCanvas(canvasWidth, canvasHeight);
    engine = Matter.Engine.create();
    world = engine.world;
    drawTable();
    initializeBalls();
    cue = new Cue(20, canvasHeight / 2, cueLength, 0);
    cue.draw();
}

function draw() {
    background(200); // Table background color
    drawTable();
    balls.forEach(ball => ball.draw());

    cue.draw();
    handleCollisions();
    // Update physics engine
}

function windowResized() {
    resizeSketch();
    resizeCanvas(canvasWidth, canvasHeight);
    balls = [];
    initializeBalls();
    cue = new Cue(20, canvasHeight / 2, cueLength, 0);
}

function resizeSketch() {
    /**
     * windowWidth / (144 + 58 * 2): This part calculates a scaling factor based on the width of the browser window (windowWidth). The denominator (144 + 58 * 2) represents the full length of the snooker table (144 inches/12 ft) plus two and a half times the length of the cue (58 inches) on either side. This calculation determines how much the full-size table and cue should be scaled down to fit the window width.
     * windowHeight / (72 + 58 * 2): Similarly, this calculates a scaling factor based on the height of the browser window (windowHeight). Here, 72 inches (6 ft) is half the length of the snooker table, accounting for the 2:1 aspect ratio of a standard table, and again 58 inches is the cue length, considered on both top and bottom of the table.
     * I choose the smaller of these two scale factors because it ensures that the entire table and cues will fit within the viewport, irrespective of whether the limiting dimension is width or height.
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


function drawTable() {
    // Set the fill color for the table
    fill(0, 100, 0); // Dark green for the snooker table

    // Draw the table as a rectangle with rounded corners
    rectMode(CENTER);
    rect(canvasWidth / 2, canvasHeight / 2, tableWidth, tableHeight, 20); // 20 is the radius for rounded corners

    // Draw the pockets
    fill(0); // Black for the pockets
    ellipseMode(CENTER);

    // Pocket positions (corners and midpoints of longer sides)
    var pocketPositions = [
        { x: canvasWidth / 2 - tableWidth / 2, y: canvasHeight / 2 - tableHeight / 2 },
        { x: canvasWidth / 2 + tableWidth / 2, y: canvasHeight / 2 - tableHeight / 2 },
        { x: canvasWidth / 2 - tableWidth / 2, y: canvasHeight / 2 + tableHeight / 2 },
        { x: canvasWidth / 2 + tableWidth / 2, y: canvasHeight / 2 + tableHeight / 2 },
        { x: canvasWidth / 2, y: canvasHeight / 2 - tableHeight / 2 },
        { x: canvasWidth / 2, y: canvasHeight / 2 + tableHeight / 2 }
    ];

    // Draw each pocket
    for (var i = 0; i < pocketPositions.length; i++) {
        var pos = pocketPositions[i];
        ellipse(pos.x, pos.y, pocketSize, pocketSize);
    }

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

function drawBalls() {

    let pinkBallX = canvasWidth / 2 + tableWidth / 5;
    let pinkBallY = canvasHeight / 2; // Center of the table height-wise
    fill('pink');
    ellipse(pinkBallX, pinkBallY, ballDiameter, ballDiameter);
    let redsTriangleStartX = canvasWidth / 2 + tableWidth / 4.3;
    let redsTriangleStartY = canvasHeight / 2;
    let rowLength = 5;
    for (let row = 0; row < rowLength; row++) {
        for (let col = 0; col <= row; col++) {
            let x = redsTriangleStartX + row * ballDiameter;
            let y = redsTriangleStartY + row * ballDiameter / 2 - col * ballDiameter;
            fill('red');
            ellipse(x, y, ballDiameter, ballDiameter);
        }
    }

    // Position the yellow, green, and brown balls on the baulk line
    drawColoredBall('yellow', baulkLineX, pinkBallY + 11.5 * scale);
    drawColoredBall('green', baulkLineX, pinkBallY - 11.5 * scale);
    drawColoredBall('brown', baulkLineX, pinkBallY);

    // Blue ball at the center of the table
    drawColoredBall('blue', canvasWidth / 2, canvasHeight / 2);

    let blackBallX = redsTriangleStartX + 7 * ballDiameter;
    let blackBallY = pinkBallY;
    drawColoredBall('black', blackBallX, blackBallY);
}

function handleCollisions() {
    // Handle collisions and update game state
}
