function drawTable() {
    // Draw the main table area
    fill(0, 100, 0); // Dark green for the snooker table
    rectMode(CENTER);
    rect(canvasWidth / 2, canvasHeight / 2, tableWidth, tableHeight);

    // Draw table edges
    let edgeWidth = 10 * scale;
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
    let damping = 0.98;
    let velX = ball.body.velocity.x * damping;
    let velY = ball.body.velocity.y * damping;
    Body.setVelocity(ball.body, { x: velX, y: velY });
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
            //cue.setPosition(cueOriginalPosition.x, cueOriginalPosition.y);
            cue.setPosition(cueInitialX, cueInitialY);
        }
    } else if (!isCuePullingBack && cuePushForwardDistance <= 0 && isCueHitting) {
        isCueHitting = false;
        cue.setPosition(cueOriginalPosition.x, cueOriginalPosition.y);
    }
}
