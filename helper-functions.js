function createTable() {
    table = Bodies.rectangle(canvasWidth / 2, canvasHeight / 2, tableWidth, tableHeight, {
        isStatic: true,
        isSensor: true,
        render: {
            fillStyle: '#006400', // Dark green color for the table
            strokeStyle: 'black', // Optional border color
            lineWidth: 1
        }
    });
    oldCenter = { x: table.position.x, y: table.position.y };
    World.add(world, table);
}

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
    balls.push(cueBall);
    World.add(world, cueBall)

    const positions = [
        { x: startX, y: startY, color: 'red' },
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

function releaseCue() {
    // Reset the cue position to its original position
    Body.setPosition(cue.body, { x: cueStartX, y: cueStartY });

    // Calculate the direction and magnitude of the force
    var forceDirection = {
        x: cueBall.body.position.x - cueStartX,
        y: cueBall.body.position.y - cueStartY
    };
    var normalizedDirection = Matter.Vector.normalise(forceDirection);
    var forceMagnitude = 0.002; // Adjust based on desired force magnitude
    var force = {
        x: normalizedDirection.x * forceMagnitude,
        y: normalizedDirection.y * forceMagnitude
    };

    // Apply the force to the cue ball
    Body.applyForce(cueBall.body, cueBall.body.position, force);

    isCuePulledBack = false;
}