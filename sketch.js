var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;

var engine, world, render;

var balls, cue, cushions;

function setup() {
    engine = Engine.create();
    world = engine.world;

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

    createTable();

    // Create snooker table edges as static bodies
    createTableEdges(); // Define this function to add table edges to the world

    // Create balls as dynamic bodies
    initializeBalls(); // Modify your existing function to use Matter.js bodies

    // Create cue as a dynamic body
    createCue(); // Modify your existing Cue class to use Matter.js body

    // Add cushions as static bodies
    cushions = [];
    createCushions(); // Modify your existing Cushion class to use Matter.js body

    // Running the engine and the renderer
    Engine.run(engine);
    Render.run(render);
}

function createTable() {
    var table = Bodies.rectangle(canvasWidth / 2, canvasHeight / 2, tableWidth, tableHeight, {
        isStatic: true,
        render: {
            fillStyle: '#006400' // Dark green color for the table
        }
    });
    World.add(world, table);

}

function createTableEdges() {
    let topEdge = Bodies.rectangle(canvasWidth / 2, canvasHeight / 2 - tableHeight / 2, tableWidth, 10, { isStatic: true });
    let bottomEdge = Bodies.rectangle(canvasWidth / 2, canvasHeight / 2 + tableHeight / 2, tableWidth, 10, { isStatic: true });
    let leftEdge = Bodies.rectangle(canvasWidth / 2 - tableWidth / 2, canvasHeight / 2, 10, tableHeight, { isStatic: true });
    let rightEdge = Bodies.rectangle(canvasWidth / 2 + tableWidth / 2, canvasHeight / 2, 10, tableHeight, { isStatic: true });

    World.add(world, [topEdge, bottomEdge, leftEdge, rightEdge]);
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

function initializeBalls() {
    // Example ball properties, adjust as necessary
    const restitution = 0.9; // Bounciness
    const friction = 0.05;   // Sliding resistance

    // Clear existing balls array if any
    balls = [];

    // Create balls and add them to the world and balls array
    // Example positions and colors, modify as needed for your game setup
    const positions = [[100, 100, 'red'], [150, 100, 'blue'], [200, 100, 'yellow']];
    positions.forEach(pos => {
        let ball = Bodies.circle(pos[0], pos[1], ballDiameter / 2, {
            restitution: restitution,
            friction: friction,
            render: {
                fillStyle: pos[2]
            }
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


