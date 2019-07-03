
// Class for mouse press fun stuff
class Particle { 
    constructor(position, force, hue, env) {
        this.position = env.createVector(position.x, position.y);
        this.velocity = env.createVector(force.x, force.y);
        this.drag     = 0.95;
        this.lifespan = 255;
        this.env      = env;
    }

    update() {
        // Move it
        this.position.add(this.velocity);
        // Slow it down
        this.velocity.mult(this.drag);
        // Fade it out
        this.lifespan--;
    }

    // Draw particle and connect it with a line
    // Draw a line to another
    display(other) {
        // ooo colors :)
        this.env.stroke(this.env.map(this.position.x, 0, this.env.width, 0, 255), this.env.map(this.position.y, 0, this.env.height, 0, 255), this.lifespan);
        this.env.fill(0, this.lifespan / 2);
        this.env.ellipse(this.position.x, this.position.y, 8, 8);
        // If we need to draw a line
        if (other) {
            this.env.line(this.position.x, this.position.y, other.position.x, other.position.y);
        }
    }
}

// Class path for mouse press fun :b
class Path {
    constructor(env) {
        this.particles = [];
        this.hue       = env.random(100);
        this.env       = env;
    }

    add(position, force) {
        // Add a new particle with a position, force, and hue
        this.particles.push(new Particle(position, force, this.hue, this.env));
    }

    // Display path
    update() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update();
        }
    }

    // Display path
    display() {
        // Loop through backwards
        for (let i = this.particles.length - 1; i >= 0; i--) {
            // If we shold remove it
            if (this.particles[i].lifespan <= 0) {
                this.particles.splice(i, 1);
                // Otherwise, display it
            } else {
                this.particles[i].display(this.particles[i + 1]);
            }
        }

    }
}