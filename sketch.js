var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;

var engine, world, render;

var balls, cue, cueBall, cushions, table, topEdge, bottomEdge, leftEdge, rightEdge;

var scale, tableWidth, tableHeight, ballDiameter, pocketSize, cueLength, canvasWidth, canvasHeight;

var mouse, mouseConstraint;

function setup() {
    engine = Engine.create();
    world = engine.world;
    world.gravity.y = 0;
    world.gravity.x = 0;


    // Initialize scale and dimensions for the table, balls, etc.
    initializeDimensions(); // You need to define this function to set canvasWidth, canvasHeight, etc.

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
    scale = Math.min(windowWidth / (144 + 58 * 2.5), windowHeight / (72 + 58 * 2.5));

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
}

window.addEventListener('resize', function () {
    // Recalculate scale and dimensions based on new window size
    scale = Math.min(window.innerWidth / (144 + 58 * 2.5), window.innerHeight / (72 + 58 * 2.5));
    tableWidth = 144 * scale;
    tableHeight = 72 * scale;
    ballDiameter = tableWidth / 36;
    pocketSize = ballDiameter * 1.5;
    cueLength = 58 * scale;
    canvasWidth = tableWidth + cueLength * 2.5;
    canvasHeight = tableHeight + cueLength * 2.5;

    // Update render dimensions
    render.canvas.width = canvasWidth;
    render.canvas.height = canvasHeight;
    render.bounds.max.x = canvasWidth;
    render.bounds.max.y = canvasHeight;

    // Reposition table edges, balls, and cushions
    //var oldTableWidth = tableWidth;
    //var oldTableHeight = tableHeight;
    storePositions();

    World.clear(world, false);
    createTable();

    // Create snooker table edges as static bodies
    World.remove(world, [topEdge, bottomEdge, leftEdge, rightEdge]);
    createTableEdges(); // Define this function to add table edges to the world

    // Add cushions as static bodies
    cushions = [];
    createCushions();

    // Recalculate scale and dimensions based on new window size
    // [Your existing code for recalculating dimensions]

    //initializeBalls();
    cueBall = null;
    balls = [];
    initializeBalls();
    cue = null;
    createCue();
    balls.forEach(ball => {
        if (ball.storedX !== undefined && ball.storedY !== undefined) {
            Body.setPosition(ball.body, {
                x: ball.storedX * tableWidth + canvasWidth / 2,
                y: ball.storedY * tableHeight + canvasHeight / 2
            });
        }
    });

    if (cue.storedX !== undefined && cue.storedY !== undefined) {
        Body.setPosition(cue.body, {
            x: cue.storedX * tableWidth + canvasWidth / 2,
            y: cue.storedY * tableHeight + canvasHeight / 2
        });
    }

    Engine.update(engine);
});

function storePositions() {
    // Store positions of balls
    balls.forEach(ball => {
        if (ball && ball.body && ball.body.position) {
            ball.storedX = (ball.body.position.x - canvasWidth / 2) / tableWidth;
            ball.storedY = (ball.body.position.y - canvasHeight / 2) / tableHeight;
        }
    });

    // Store position of the cue
    if (cue && cue.body && cue.body.position) {
        cue.storedX = (cue.body.position.x - canvasWidth / 2) / tableWidth;
        cue.storedY = (cue.body.position.y - canvasHeight / 2) / tableHeight;
    }
}


function createTable() {
    var table = Bodies.rectangle(canvasWidth / 2, canvasHeight / 2, tableWidth, tableHeight, {
        isStatic: true,
        isSensor: true,
        render: {
            fillStyle: '#006400', // Dark green color for the table
            strokeStyle: 'black', // Optional border color
            lineWidth: 1
        }
    });
    World.add(world, table);
}

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


function createTableEdges() {
    topEdge = Bodies.rectangle(canvasWidth / 2, canvasHeight / 2 - tableHeight / 2, tableWidth, 10, { isStatic: true });
    bottomEdge = Bodies.rectangle(canvasWidth / 2, canvasHeight / 2 + tableHeight / 2, tableWidth, 10, { isStatic: true });
    leftEdge = Bodies.rectangle(canvasWidth / 2 - tableWidth / 2, canvasHeight / 2, 10, tableHeight, { isStatic: true });
    rightEdge = Bodies.rectangle(canvasWidth / 2 + tableWidth / 2, canvasHeight / 2, 10, tableHeight, { isStatic: true });

    World.add(world, [topEdge, bottomEdge, leftEdge, rightEdge]);
}

function initializeBalls() {
    const restitution = 0.9; // Bounciness
    const friction = 0.05;   // Sliding resistance

    balls = [];

    // Calculate positions relative to the table and cushion dimensions
    const cushionOffset = 5 * scale; // Adjust as needed
    const startX = canvasWidth / 2 - tableWidth / 2 + cushionOffset + ballDiameter;
    const startY = canvasHeight / 2;

    cueBall = new CueBall(startX, startY, ballDiameter);

    const positions = [
        { x: startX, y: startY, color: 'red' },
        { x: startX + ballDiameter * 1.5, y: startY, color: 'blue' },
        { x: startX + ballDiameter * 3, y: startY, color: 'yellow' }
        // Add more balls as needed
    ];

    positions.forEach(pos => {
        let ball = Bodies.circle(pos.x, pos.y, ballDiameter / 2, {
            restitution: restitution,
            friction: friction,
            render: { fillStyle: pos.color }
        });
        World.add(world, ball);
        balls.push(ball);
    });
}


function createCue() {
    // Parameters: x position, y position, length, and angle of the cue
    // These values can be adjusted as needed
    let x = canvasWidth / 2;
    let y = canvasHeight / 2;
    let length = cueLength;
    let angle = 0; // Initial angle, can be horizontal or any angle you prefer

    cue = new Cue(x, y, length, angle);
}

function createCushions() {
    // Dimensions for the cushions
    let cushionThickness = 4 * scale;
    let cushionLength = tableWidth;
    let cushionWidth = cushionThickness;

    // Create cushions at each side of the table
    cushions.push(new Cushion(canvasWidth / 2, canvasHeight / 2 - tableHeight / 2, cushionLength, cushionWidth)); // Top cushion
    cushions.push(new Cushion(canvasWidth / 2, canvasHeight / 2 + tableHeight / 2, cushionLength, cushionWidth)); // Bottom cushion
    cushions.push(new Cushion(canvasWidth / 2 - tableWidth / 2, canvasHeight / 2, cushionWidth, tableHeight)); // Left cushion
    cushions.push(new Cushion(canvasWidth / 2 + tableWidth / 2, canvasHeight / 2, cushionWidth, tableHeight)); // Right cushion
}

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

/**
 function mouseReleased() {
    if (isMouseNearCue(mouseX, mouseY)) {
        // Calculate the direction and magnitude of the force
        var forceMagnitude = 0.02; // Adjust based on your requirements
        var forceDirection = { x: cueBall.body.position.x - cue.body.position.x, y: cueBall.body.position.y - cue.body.position.y };
        // Normalize the direction
        var force = Matter.Vector.normalise(forceDirection);
        // Apply the force to the cue ball
        Body.applyForce(cueBall.body, cueBall.body.position, { x: force.x * forceMagnitude, y: force.y * forceMagnitude });
    }
}
 */

function keyPressed() {
    if (keyCode === 32) { // Space bar
        // Calculate the direction of the force
        let direction = {
            x: cueBall.body.position.x - cue.body.position.x,
            y: cueBall.body.position.y - cue.body.position.y
        };

        // Normalize the direction
        let normalizedDirection = Matter.Vector.normalise(direction);

        // Set the force magnitude
        let forceMagnitude = 0.001; // Adjust this value based on your requirements

        // Apply the force to the cue ball
        Body.applyForce(cueBall.body, cueBall.body.position, {
            x: normalizedDirection.x * forceMagnitude,
            y: normalizedDirection.y * forceMagnitude
        });
    }
}

var cueStartX, cueStartY;
var isDraggingCue = false;

function mouseDragged() {
    if (isMouseNearCue(mouseX, mouseY)) {
        isDraggingCue = true;
        // Save initial position for calculating force direction
        cueStartX = cue.body.position.x;
        cueStartY = cue.body.position.y;
        // Drag the cue stick
        Body.setPosition(cue.body, { x: mouseX, y: mouseY });
    }
}

function mouseReleased() {
    if (isDraggingCue) {
        // Calculate force direction based on how far the cue stick is pulled
        var dx = cueStartX - cue.body.position.x;
        var dy = cueStartY - cue.body.position.y;
        var forceMagnitude = 0.005 * Math.sqrt(dx * dx + dy * dy); // Adjust the multiplier as needed
        var forceDirection = Matter.Vector.normalise({ x: dx, y: dy });

        // Apply the force to the cue ball
        Body.applyForce(cueBall.body, cueBall.body.position, {
            x: forceDirection.x * forceMagnitude,
            y: forceDirection.y * forceMagnitude
        });

        // Reset cue stick position
        Body.setPosition(cue.body, { x: cueStartX, y: cueStartY });
        isDraggingCue = false;
    }
}

