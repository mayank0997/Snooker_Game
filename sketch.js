var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.Composite;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Events = Matter.Events;

var engine, world, render;

var balls, cue, cueBall, cushions, table, topEdge, bottomEdge, leftEdge, rightEdge;

var scale, tableWidth, tableHeight, ballDiameter, pocketSize, cueLength, canvasWidth, canvasHeight;
var baulkLineX;

var cushionThickness;

var mouse, mouseConstraint;

//old center of table
var oldCenter;

var pockets;

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

    pockets = createPockets();

    removeBallOnPocketCollision();

    // Create balls as dynamic bodies
    initializeBalls();

    // Create snooker table edges as static bodies
    //createTableEdges(); // Define this function to add table edges to the world

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

    baulkLineX = (canvasWidth / 2) - (tableWidth / 2) + (29 * scale);

    render.canvas.width = canvasWidth;
    render.canvas.height = canvasHeight;
    render.bounds.max.x = canvasWidth;
    render.bounds.max.y = canvasHeight;

    oldCenter = { x: canvasWidth / 2, y: canvasHeight / 2 };
}

//ensures responsiveness
window.addEventListener('resize', function () {
    // Store old dimensions for scaling calculation
    var oldCanvasWidth = canvasWidth;
    var oldCanvasHeight = canvasHeight;

    // Reinitialize dimensions
    initializeDimensions();

    // Calculate scale factors
    var scaleX = canvasWidth / oldCanvasWidth;
    var scaleY = canvasHeight / oldCanvasHeight;

    // Scale the entire world
    Matter.Composite.scale(world, scaleX, scaleY, oldCenter);

    // Calculate the translation offsets
    var offsetX = (canvasWidth / 2) - oldCenter.x;
    var offsetY = (canvasHeight / 2) - oldCenter.y;

    // Translate the entire world
    Matter.Composite.translate(world, { x: offsetX, y: offsetY });

    // Update old center for next resize
    oldCenter = { x: canvasWidth / 2, y: canvasHeight / 2 };

    // Update render dimensions
    render.canvas.width = canvasWidth;
    render.canvas.height = canvasHeight;
    render.bounds.max.x = canvasWidth;
    render.bounds.max.y = canvasHeight;

    Engine.update(engine);

});

function updateElementsPosition(deltaX, deltaY) {
    // Update the table position
    Body.setPosition(table, { x: table.position.x + deltaX, y: table.position.y + deltaY });

    // Update positions of balls
    balls.forEach(ball => {
        Body.setPosition(ball.body, {
            x: ball.body.position.x + deltaX,
            y: ball.body.position.y + deltaY
        });
    });

    // Update cue position
    Body.setPosition(cue.body, {
        x: cue.body.position.x + deltaX,
        y: cue.body.position.y + deltaY
    });

    // Update cushions position
    cushions.forEach(cushion => {
        // Recalculate cushion position based on new table dimensions and positions
        let newX = cushion.x * scale + deltaX;
        let newY = cushion.y * scale + deltaY;
        Body.setPosition(cushion.body, { x: newX, y: newY });
    });
}

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



