
function getTextSize() {
    return max(8, 7 * scale);
}

function drawTable() {
    // Draw the main table area
    fill(0, 100, 0); // Dark green for the snooker table
    rectMode(CENTER);
    rect(canvasWidth / 2, canvasHeight / 2, tableWidth, tableHeight);

    // Draw table edges
    var edgeWidth = 10 * scale;
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

    for (var pos of pocketPositions) {
        pockets.push(new Pocket(pos.x, pos.y, pocketSize));
    }
}

function initializeBalls(mode) {
    console.log("Initializing balls in mode: " + mode);
    // Clear existing balls
    World.remove(world, balls.map(ball => ball.body));
    balls = [];

    if (cueBall) {
        World.remove(world, cueBall.body);
        isCueBallPocketed = true;
        cueBall = null;
    }

    if (mode === 'randomAll') {
        // Add all balls at random positions
        const colors = ['pink', 'yellow', 'green', 'brown', 'blue', 'black'];
        for (var i = 0; i < 15; i++)
            colors.push('red');
        colors.forEach(color => {
            var x = random(tableWidth / 4, 3 * tableWidth / 4) + canvasWidth / 2 - tableWidth / 2;
            var y = random(tableHeight / 4, 3 * tableHeight / 4) + canvasHeight / 2 - tableHeight / 2;
            balls.push(new Ball(x, y, ballDiameter, color));
        });
    } else if (mode === 'randomReds') {
        // Place red balls in random positions and colored balls in official positions
        initializeColoredBalls();
        for (var i = 0; i < 15; i++) {
            var x = random(tableWidth / 4, 3 * tableWidth / 4) + canvasWidth / 2 - tableWidth / 2;
            var y = random(tableHeight / 4, 3 * tableHeight / 4) + canvasHeight / 2 - tableHeight / 2;
            balls.push(new Ball(x, y, ballDiameter, 'red'));
        }
    } else if (mode === 'start') {
        // Initialize and create each ball in official positions
        initializeColoredBalls();
        initializeRedBalls();
    }

    // Reset potted balls history
    pottedBallsHistory = [];
}

function initializeColoredBalls() {
    var initBallX = canvasWidth / 2 + tableWidth / 5;
    var initBallY = canvasHeight / 2; // Center of the table height-wise
    balls.push(new Ball(initBallX, initBallY, ballDiameter, 'pink'));
    balls.push(new Ball(baulkLineX, initBallY + 11.5 * scale, ballDiameter, 'yellow'));
    balls.push(new Ball(baulkLineX, initBallY - 11.5 * scale, ballDiameter, 'green'));
    balls.push(new Ball(baulkLineX, initBallY, ballDiameter, 'brown'));
    balls.push(new Ball(canvasWidth / 2, canvasHeight / 2, ballDiameter, 'blue'));
    var blackBallX = canvasWidth / 2 + tableWidth / 4.3 + 7 * ballDiameter;
    balls.push(new Ball(blackBallX, canvasHeight / 2, ballDiameter, 'black'));
}

function initializeRedBalls() {
    var redsTriangleStartX = canvasWidth / 2 + tableWidth / 4.3;
    var redsTriangleStartY = canvasHeight / 2;
    var rowLength = 5;
    for (var row = 0; row < rowLength; row++) {
        for (var col = 0; col <= row; col++) {
            var x = redsTriangleStartX + row * ballDiameter;
            var y = redsTriangleStartY + row * ballDiameter / 2 - col * ballDiameter;
            balls.push(new Ball(x, y, ballDiameter, 'red'));
        }
    }
}



function createCushions() {
    cushionThickness = 2.5 * scale;
    var horizontalCushionLength = (tableWidth - 2 * pocketSize) / 2; // Horizontal cushion length excluding pockets

    var pocketOffset = pocketSize / 2;

    // Top and Bottom Cushions (split into two segments each)
    cushions.push(new Cushion(canvasWidth / 2 - horizontalCushionLength / 2 - pocketOffset, canvasHeight / 2 - tableHeight / 2, horizontalCushionLength, cushionThickness));
    cushions.push(new Cushion(canvasWidth / 2 + horizontalCushionLength / 2 + pocketOffset, canvasHeight / 2 - tableHeight / 2, horizontalCushionLength, cushionThickness));
    cushions.push(new Cushion(canvasWidth / 2 - horizontalCushionLength / 2 - pocketOffset, canvasHeight / 2 + tableHeight / 2, horizontalCushionLength, cushionThickness));
    cushions.push(new Cushion(canvasWidth / 2 + horizontalCushionLength / 2 + pocketOffset, canvasHeight / 2 + tableHeight / 2, horizontalCushionLength, cushionThickness));

    // Left and Right Cushions (continuous)
    var leftCushionX = canvasWidth / 2 - tableWidth / 2;
    var rightCushionX = canvasWidth / 2 + tableWidth / 2;
    cushions.push(new Cushion(leftCushionX, canvasHeight / 2, cushionThickness, tableHeight));
    cushions.push(new Cushion(rightCushionX, canvasHeight / 2, cushionThickness, tableHeight));

}


// Function to constrain a ball within table bounds and apply damping
function constrainBall(ball) {
    // Define the overlap distance outside the cushions
    var cushionOverlap = 2 * scale;

    // Adjusted table boundaries
    var minX = canvasWidth / 2 - tableWidth / 2 + cushionOverlap;
    var maxX = canvasWidth / 2 + tableWidth / 2 - cushionOverlap;
    var minY = canvasHeight / 2 - tableHeight / 2 + cushionOverlap;
    var maxY = canvasHeight / 2 + tableHeight / 2 - cushionOverlap;

    // Constrain position
    if (ball) {
        var posX = constrain(ball.body.position.x, minX, maxX);
        var posY = constrain(ball.body.position.y, minY, maxY);
        Body.setPosition(ball.body, { x: posX, y: posY });

        // Apply damping to velocity
        var damping = 0.98;
        var velX = ball.body.velocity.x * damping;
        var velY = ball.body.velocity.y * damping;
        Body.setVelocity(ball.body, { x: velX, y: velY });
    }
}

function getBallPoints(color) {
    switch (color) {
        case 'red': return 1;
        case 'yellow': return 2;
        case 'green': return 3;
        case 'brown': return 4;
        case 'blue': return 5;
        case 'pink': return 6;
        case 'black': return 7;
        default: return 0;
    }
}

function handlePocketCollision(bodyA, bodyB) {
    if (bodyA.isSensor || bodyB.isSensor) {
        var ball = bodyA.isSensor ? bodyB : bodyA;

        if (ball == cueBall.body) {
            isCueBallPocketed = true;
            World.remove(world, cueBall.body);
            cueBall = null;
            score -= 4; // Standard penalty for a cue ball foul
            promptMessage = "Cue ball pocketed -4 points";
        } else {
            var points = getBallPoints(ball.ballInstance.color);
            score += points;
            promptMessage = `${ball.ballInstance.color} ball pocketed +${points} points`;
            if (ball.ballInstance.color === 'red') {
                // Remove red ball from array and world
                if (ball.body)
                    World.remove(world, ball.body);
                balls = balls.filter(b => b.body !== ball);
                score++;
            }
            else if (ball.ballInstance.color !== 'red') {
                var originalSpot = ball.ballInstance.originalPosition;
                Body.setPosition(ball, originalSpot);
                Body.setVelocity(ball, { x: 0, y: 0 });
                promptMessage = ball.ballInstance.color + " ball returned to original position";
            }
            pottedBallsHistory.push(ball.ballInstance.color);

            // Check for mistake (two consecutive non-red balls)
            if (pottedBallsHistory.length >= 2) {
                var lastTwoBalls = pottedBallsHistory.slice(-2);
                if (lastTwoBalls[0] !== 'red' && lastTwoBalls[1] !== 'red') {
                    promptMessage = "Mistake: Two consecutive coloured balls potted!";
                    pottedBallsHistory = [];
                }
            }
        }
    }

}

function handleCueCollision(bodyA, bodyB) {
    if ((bodyA.label === 'Cue' && bodyB.label === 'cueBall') || (bodyA.label === 'cueBall' && bodyB.label === 'Cue')) {
        promptMessage = "Cue striking cue ball";
    }
}

function handleBallCollision(bodyA, bodyB) {
    if ((bodyA.label === 'cueBall' && bodyB.label === 'Ball') || (bodyA.label === 'Ball' && bodyB.label === 'cueBall')) {
        var otherBall = bodyA.label === 'cueBall' ? bodyB : bodyA;
        promptMessage = "Cue ball collided with " + otherBall.ballInstance.color + " ball";
    }
}

function handleCushionCollision(bodyA, bodyB) {
    if ((bodyA.label === 'cueBall' && bodyB.label === 'Cushion') || (bodyA.label === 'Cushion' && bodyB.label === 'cueBall')) {
        promptMessage = "Cue ball struck cushion";
    }
}


function hitCueBall() {
    isCueHitting = true;
    isCuePullingBack = true; // Setting this flag to true to start the pullback process
    cuePullBackDistance = 20 * scale;
    cuePushForwardDistance = 20 * scale;
    cueOriginalPosition = createVector(cue.x, cue.y); // Store original position
}

function animateCueHit() {
    if (isCuePullingBack) {
        if (cuePullBackDistance > 0) {
            var moveX = -cueAnimationSpeed * cos(cue.angle);
            var moveY = -cueAnimationSpeed * sin(cue.angle);
            cue.setPosition(cue.x + moveX, cue.y + moveY);
            cuePullBackDistance -= cueAnimationSpeed;
        } else {
            isCuePullingBack = false;
            cuePushForwardDistance = cuePullBackDistance + 10 * scale;
        }
    } else if (cuePushForwardDistance > 0) {
        var moveX = cueAnimationSpeed * cos(cue.angle);
        var moveY = cueAnimationSpeed * sin(cue.angle);
        cue.setPosition(cue.x + moveX, cue.y + moveY);
        cuePushForwardDistance -= cueAnimationSpeed;

        var cueTipX = cue.x + cos(cue.angle) * cue.length / 2;
        var cueTipY = cue.y + sin(cue.angle) * cue.length / 2;

        if (cueBall) {
            var distance = dist(cueTipX, cueTipY, cueBall.body.position.x, cueBall.body.position.y);
            if (distance < 18 * scale) {
                var forceDirection = p5.Vector.fromAngle(cue.angle);
                var forceMagnitude = 0.002 * scale;
                var force = forceDirection.mult(forceMagnitude);
                console.log("force being applied");
                Body.applyForce(cueBall.body, cueBall.body.position, force);
                isCueHitting = false;
                cue.setPosition(cueInitialX, cueInitialY);
            }
        }
    } else if (!isCuePullingBack && cuePushForwardDistance <= 0 && isCueHitting) {
        isCueHitting = false;
        cue.setPosition(cueOriginalPosition.x, cueOriginalPosition.y);
    }
}
