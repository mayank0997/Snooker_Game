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

    // Add custom rendering for baulk line and D-shaped semi-circle
    render.options.wireframes = false;
    render.options.showAngleIndicator = false;
    render.options.background = 'transparent';

    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: canvasWidth, y: canvasHeight }
    });

    Matter.Events.on(render, 'afterRender', () => {
        var ctx = render.context;

        // Drawing the baulk line
        ctx.beginPath();
        ctx.moveTo(baulkLineX, canvasHeight / 2 - tableHeight / 2);
        ctx.lineTo(baulkLineX, canvasHeight / 2 + tableHeight / 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Drawing the D-shaped semi-circle
        ctx.beginPath();
        ctx.arc(baulkLineX, canvasHeight / 2, 11.5 * scale, Math.PI / 2, -Math.PI / 2, false);
        ctx.stroke();
    });
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

    // Cue ball
    var cueBallX = baulkLineX - 11 * scale;
    var cueBallY = canvasHeight / 2;
    cueBall = new CueBall(cueBallX, cueBallY, ballDiameter);
    World.add(world, cueBall.body);

    // Colored balls
    // Pink
    var pinkBallX = canvasWidth / 2 + tableWidth / 5;
    balls.push(new Ball(pinkBallX, cueBallY, ballDiameter, 'pink'));

    // Yellow, Green, Brown on Baulk line
    balls.push(new Ball(baulkLineX, cueBallY + 11.5 * scale, ballDiameter, 'yellow'));
    balls.push(new Ball(baulkLineX, cueBallY - 11.5 * scale, ballDiameter, 'green'));
    balls.push(new Ball(baulkLineX, cueBallY, ballDiameter, 'brown'));

    // Blue at the center
    balls.push(new Ball(canvasWidth / 2, canvasHeight / 2, ballDiameter, 'blue'));

    // Red balls in a triangle formation
    var redsTriangleStartX = canvasWidth / 2 + tableWidth / 4.3;
    var rowLength = 5;
    for (let row = 0; row < rowLength; row++) {
        for (let col = 0; col <= row; col++) {
            let x = redsTriangleStartX + row * ballDiameter;
            let y = cueBallY + row * ballDiameter / 2 - col * ballDiameter;
            balls.push(new Ball(x, y, ballDiameter, 'red'));
        }
    }

    // Black ball
    var blackBallX = redsTriangleStartX + 7 * ballDiameter;
    balls.push(new Ball(blackBallX, cueBallY, ballDiameter, 'black'));

    // Add all balls to the world
    balls.forEach(ball => {
        World.add(world, ball.body);
    });
}


function createCue() {
    // Parameters: x position, y position, length, and angle of the cue
    // These values can be adjusted as needed
    var x = 20;
    var y = canvasHeight / 2;
    var length = cueLength;
    var angle = 0; // Initial angle, can be horizontal or any angle you prefer

    cue = new Cue(x, y, length, angle);
}

function createCushions() {
    let cushionThickness = 4 * scale;
    let horizontalCushionLength = (tableWidth - 3 * pocketSize) / 2; // Horizontal cushion length excluding pockets
    let verticalCushionHeight = (tableHeight - 2 * pocketSize) / 2; // Vertical cushion height excluding pockets

    // Top and Bottom Cushions (split into two segments each)
    cushions.push(new Cushion(canvasWidth / 2 - horizontalCushionLength / 2 - pocketSize / 2, canvasHeight / 2 - tableHeight / 2, horizontalCushionLength, cushionThickness));
    cushions.push(new Cushion(canvasWidth / 2 + horizontalCushionLength / 2 + pocketSize / 2, canvasHeight / 2 - tableHeight / 2, horizontalCushionLength, cushionThickness));
    cushions.push(new Cushion(canvasWidth / 2 - horizontalCushionLength / 2 - pocketSize / 2, canvasHeight / 2 + tableHeight / 2, horizontalCushionLength, cushionThickness));
    cushions.push(new Cushion(canvasWidth / 2 + horizontalCushionLength / 2 + pocketSize / 2, canvasHeight / 2 + tableHeight / 2, horizontalCushionLength, cushionThickness));

    // Left and Right Cushions (split into two segments each)
    cushions.push(new Cushion(canvasWidth / 2 - tableWidth / 2, canvasHeight / 2 - verticalCushionHeight / 2 - pocketSize / 2, cushionThickness, verticalCushionHeight));
    cushions.push(new Cushion(canvasWidth / 2 - tableWidth / 2, canvasHeight / 2 + verticalCushionHeight / 2 + pocketSize / 2, cushionThickness, verticalCushionHeight));
    cushions.push(new Cushion(canvasWidth / 2 + tableWidth / 2, canvasHeight / 2 - verticalCushionHeight / 2 - pocketSize / 2, cushionThickness, verticalCushionHeight));
    cushions.push(new Cushion(canvasWidth / 2 + tableWidth / 2, canvasHeight / 2 + verticalCushionHeight / 2 + pocketSize / 2, cushionThickness, verticalCushionHeight));
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

function createPockets() {
    // Define positions for the six pockets (four corners and two sides)
    var pocketPositions = [
        { x: canvasWidth / 2 - tableWidth / 2, y: canvasHeight / 2 - tableHeight / 2 }, // Top left
        { x: canvasWidth / 2 + tableWidth / 2, y: canvasHeight / 2 - tableHeight / 2 }, // Top right
        { x: canvasWidth / 2 - tableWidth / 2, y: canvasHeight / 2 + tableHeight / 2 }, // Bottom left
        { x: canvasWidth / 2 + tableWidth / 2, y: canvasHeight / 2 + tableHeight / 2 }, // Bottom right
        { x: canvasWidth / 2, y: canvasHeight / 2 - tableHeight / 2 }, // Middle top
        { x: canvasWidth / 2, y: canvasHeight / 2 + tableHeight / 2 }  // Middle bottom
    ];

    var pockets = [];
    for (var pos of pocketPositions) {
        var pocket = Bodies.circle(pos.x, pos.y, pocketSize / 2, {
            isSensor: true,
            label: 'pocket',
            render: {
                fillStyle: 'black'
            }
        });
        pockets.push(pocket);
    }

    World.add(world, pockets);
    return pockets;
}

function removeBallOnPocketCollision() {
    Events.on(engine, 'collisionStart', function (event) {
        var pairs = event.pairs;

        for (var pair of pairs) {
            // Check if the collision is between a ball and a pocket
            if ((pair.bodyA.label === 'ball' && pair.bodyB.label === 'pocket') ||
                (pair.bodyB.label === 'ball' && pair.bodyA.label === 'pocket')) {
                // Determine which body is the ball
                var ball = pair.bodyA.label === 'ball' ? pair.bodyA : pair.bodyB;
                // Remove the ball from the world
                World.remove(world, ball);
            }
        }
    });
}
