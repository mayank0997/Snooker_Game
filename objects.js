class Ball {
    constructor(x, y, diameter, color) {
        this.color = color;
        this.diameter = diameter;
        this.relativeVelocity = { x: 0, y: 0 };
        this.relativeAngle = 0;
        this.body = Bodies.circle(x, y, diameter / 2, {
            restitution: 0.9,
            friction: 0.2,
            frictionAir: 0.01,
            label: 'Ball'
        });
        // Add body to Matter.World in sketch.js
        World.add(world, this.body);
        this.body.ballInstance = this;
    }

    isInPocket(pocketPositions) {
        for (let i = 0; i < pocketPositions.length; i++) {
            let pocket = pocketPositions[i];
            let d = dist(this.body.position.x, this.body.position.y, pocket.x, pocket.y);
            if (d < pocketSize / 2) {
                return true;
            }
        }
        return false;
    }

    draw() {
        fill(this.color);
        ellipse(this.body.position.x, this.body.position.y, this.diameter, this.diameter);
    }
}

// CueBall class definition
class CueBall extends Ball {
    constructor(x, y, diameter) {
        super(x, y, diameter, 'white');
        this.body.label = 'cueBall';
    }
}

class Cue {
    constructor(x, y, length, angle) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.angle = angle;
        this.initialPosition = createVector(x, y);

        // Create a rectangle body for the cue
        this.body = Bodies.rectangle(x, y, length, 10, {
            angle: this.angle,
            isStatic: true
        });
        World.add(world, this.body);
        // Initialize relative positions
        this.relativeX = 0;
        this.relativeY = 0;
    }

    draw() {
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);

        // Draw the main part of the cue
        stroke(139, 69, 19); // Brown color for the cue
        fill(0); // Black for the main part
        rect(0, 0, this.length, 3.5 * scale);

        // Draw the tip of the cue
        fill(255);
        rect(this.length / 2, 0, 10, 3.5 * scale);

        pop();
    }

    updateWidth(newLength) {
        this.length = newLength;
        // Update cue body width
        Body.setPosition(this.body, { x: this.body.position.x, y: this.body.position.y });
        Body.setAngle(this.body, this.angle);
    }


    setPosition(x, y) {
        Body.setPosition(this.body, { x: x, y: y });
        this.x = x;
        this.y = y;
        this.initialPosition = createVector(x, y);
    }

    resetPosition() {
        // Reset the cue's position to its initial position
        Body.setPosition(this.body, { x: this.initialPosition.x, y: this.initialPosition.y });
        //Body.setAngle(this.body, this.angle); // Reset angle if needed
    }

    setAngle(angle) {
        this.angle = angle;
        Body.setAngle(this.body, angle);
    }
}

class Cushion {
    constructor(x, y, width, height) {
        this.width = width;
        this.height = height;
        this.body = Bodies.rectangle(x, y, width, height, {
            isStatic: true,
            label: 'Cushion',
            restitution: 0.5,
            friction: 0.3

        });
        World.add(world, this.body);
    }

    draw() {
        fill('rgba(0,255,0,0.25)'); // Cushion color
        noStroke();
        rect(this.body.position.x, this.body.position.y, this.width, this.height);
    }
}

class Pocket {
    constructor(x, y, size) {
        this.size = size;
        this.body = Bodies.circle(x, y, size / 2, {
            isSensor: true,
            isStatic: true,
            label: 'Pocket'
        });
        World.add(world, this.body);
    }

    draw() {
        fill(0); // Black for the pockets
        ellipse(this.body.position.x, this.body.position.y, this.size, this.size);
    }
}

