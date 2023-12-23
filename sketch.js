var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;

var engine, world, render;

var balls, cue, cueBall, cushions, table, topEdge, bottomEdge, leftEdge, rightEdge;

var scale, tableWidth, tableHeight, ballDiameter, pocketSize, cueLength, canvasWidth, canvasHeight;

var mouse, mouseConstraint;

//old center of table
var oldCenter;

//old canvas dimensions
var oldWindowWidth = canvasWidth;
var oldWindowHeight = canvasHeight;

function setup() {
    engine = Engine.create();
    world = engine.world;
    world.gravity.y = 0;
    world.gravity.x = 0;

    render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: canvasWidth,
            height: canvasHeight,
            wireframes: false
        }
    });

    initializeDimensions();

    createTable();

    // Create balls as dynamic bodies
    initializeBalls();

    // Create snooker table edges as static bodies
    createTableEdges(); // Define this function to add table edges to the world

    // Create cue as a dynamic body
    createCue(); // Modify your existing Cue class to use Matter.js body

    // Add cushions as static bodies
    cushions = [];
    createCushions(); // Modify your existing Cushion class to use Matter.js body

    // Running the engine and the renderer
    Engine.run(engine);
    Render.run(render);
}


function initializeDimensions() {
    // Calculate the scale factor based on the browser window dimensions
    scale = Math.min(window.innerWidth / (144 + 58 * 2.5), window.innerHeight / (72 + 58 * 2.5));

    // Calculate the dimensions of the table
    tableWidth = 144 * scale; // Full-size table width scaled down
    tableHeight = 72 * scale; // Full-size table height scaled down

    // Calculate the diameter of the balls
    ballDiameter = tableWidth / 36; // Ball diameter based on table width

    // Calculate the size of the pockets
    pocketSize = ballDiameter * 1.5; // Pocket size is 1.5 times the diameter of the balls

    // Calculate the length of the cue
    cueLength = 58 * scale; // Cue length scaled down

    // Set the canvas dimensions
    canvasWidth = tableWidth + cueLength * 2.5; // Add buffer for cue movement
    canvasHeight = tableHeight + cueLength * 2.5; // Add buffer for cue movement

    render.canvas.width = canvasWidth;
    render.canvas.height = canvasHeight;
    render.bounds.max.x = canvasWidth;
    render.bounds.max.y = canvasHeight;
}

//ensures responsiveness
window.addEventListener('resize', function () {
    // Store old dimensions for scaling calculation
    var oldWindowWidth = canvasWidth;
    var oldWindowHeight = canvasHeight;

    //re-initialize dimensions
    initializeDimensions();

    // Calculate scale factors
    var newScaleX = canvasWidth / oldWindowWidth;
    var newScaleY = canvasHeight / oldWindowHeight;

    // Scale and translate the world
    Matter.Composite.scale(world, newScaleX, newScaleY, { x: canvasWidth / 2, y: canvasHeight / 2 });
    var offsetX = canvasWidth / 2 - oldCenter.x;
    var offsetY = canvasHeight / 2 - oldCenter.y;
    // Additional translation if needed
    var translation = { x: offsetX, y: offsetY };
    Matter.Composite.translate(world, translation);
    oldCenter = { x: table.position.x, y: table.position.y };
    Engine.update(engine);
});


/**
function createTable() {
    // Set fill color for the table
    fill('#006400'); // Dark green color for the table

    // Draw the table
    rectMode(CENTER);
    rect(canvasWidth / 2, canvasHeight / 2, tableWidth, tableHeight);

    // You can add more details to the table like pockets, lines, etc. here
} 

 */

/**
 function mouseDragged() {
    // Check if the mouse is near the cue stick
    if (isMouseNearCue(mouseX, mouseY)) {
        // Set the cue stick's position to the mouse's position
        Body.setPosition(cue.body, { x: mouseX, y: mouseY });
    }
}
 */

function isMouseNearCue(mouseX, mouseY) {
    // Calculate the distance between the mouse and the cue stick
    var distance = Math.sqrt(Math.pow(mouseX - cue.body.position.x, 2) + Math.pow(mouseY - cue.body.position.y, 2));
    // Define a threshold distance to determine 'nearness'
    var threshold = 50; // Adjust this value as needed
    return distance < threshold;
}

var cueStartX, cueStartY;
var isCuePulledBack = false;

function keyPressed() {
    if (keyCode === 32) { // Space bar
        if (!isCuePulledBack) {
            // Store the cue's original position
            cueStartX = cue.body.position.x;
            cueStartY = cue.body.position.y;

            // Pull back the cue by a certain distance
            Body.setPosition(cue.body, {
                x: cue.body.position.x - 50, // Adjust the pull-back distance as needed
                y: cue.body.position.y
            });

            isCuePulledBack = true;
        } else {
            // Release the cue
            releaseCue();
        }
    }
}


function mouseDragged() {
    if (isMouseNearCue(mouseX, mouseY)) {
        isDraggingCue = true;
        cueStartX = cue.body.position.x;
        cueStartY = cue.body.position.y;
        // Drag the cue back away from the cue ball
        Body.setPosition(cue.body, { x: mouseX, y: mouseY });
    }
}



