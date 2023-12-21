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

// CueBall class definition
class CueBall extends Ball {
    constructor(x, y, diameter) {
        super(x, y, diameter, 'white');
        this.body = Matter.Bodies.circle(x, y, diameter / 2, { restitution: 0.9 });
        Matter.World.add(world, this.body);
        //console.log("cue ball initialized");
    }

    draw() {
        fill(this.color);
        ellipse(this.body.position.x, this.body.position.y, this.diameter, this.diameter);
        //console.log("cue ball drawn");
    }

}

class Cue {
    constructor(x, y, length, angle) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.angle = angle;

        // Create a rectangle body for the cue
        this.body = Matter.Bodies.rectangle(x, y, length, 10, {
            angle: this.angle,
            isStatic: true
        });
        Matter.World.add(world, this.body);
    }

    draw() {
        push();
        translate(this.body.position.x, this.body.position.y);
        rotate(this.body.angle);
        stroke(139, 69, 19);
        fill(0);
        rect(0, 0, this.length, 10); // Draw the cue as a rectangle
        pop();
    }

    setPosition(x, y) {
        Matter.Body.setPosition(this.body, { x: x, y: y });
    }

    setAngle(angle) {
        Matter.Body.setAngle(this.body, angle);
    }
}

class Cushion {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        // Create a static Matter.js body for the cushion
        this.body = Matter.Bodies.rectangle(x, y, width, height, { isStatic: true });
        Matter.World.add(world, this.body);
    }

    draw() {
        fill(80); // Cushion color
        noStroke();
        rect(this.x, this.y, this.width, this.height);
    }
}
