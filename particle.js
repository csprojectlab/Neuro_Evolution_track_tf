function pldistance(p1, p2, x, y) {
    const num = abs((p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x);
    const den = p5.Vector.dist(p1, p2);
    return num / den;
  }

class Particle {
    constructor (brain) {      
        this.dead = false;  
        this.finished = false;
        this.fitness = 0;
        this.pos = createVector (start.x, start.y);
        this.vel = createVector();
        this.acc = createVector();
        this.maxSpeed = 5;
        this.maxForce = 0.2
        this.index = 0;
        this.counter = 0;
        this.sight = SIGHT;
        this.rays = [];
        for (let angle = -45; angle < 45; angle += 5)    // Think of rays every 15 degrees
            this.rays.push(new Ray(this.pos, radians(angle))); 
        // Brain of particle.
        if (brain) {   // If available make a copy of it. 
            this.brain = brain.copy();
        } else {
            this.brain = new NeuralNetwork(this.rays.length, this.rays.length * 2, 2);       
        }
    }   // End of constructor.

    /**
     * API's: show, look, update, applyForce, check, calculateFitness, dispose, mutate, bounds, highlight.
     */
    show () {
        push();
        translate (this.pos.x, this.pos.y);  // Taking axis to 0, 0
        const heading = this.vel.heading();   // Velocity vector.
        rotate(heading);     // Set the direction.
        stroke(0, 100, 255)
        fill(0, 100, 255);
        rectMode(CENTER);
        rect(0, 0, 10, 5);
        pop();
        // for (let ray of this.rays)
        //     ray.show();
        if (this.goal && showGoalsCB.checked()) 
            this.goal.show();        
    }   // End of show function.

    look (walls) {
        const inputs = [];   // Input to the neural network.
        for (let i = 0; i < this.rays.length; i++) {
            let ray = this.rays[i];
            let closest = null;    // Keep track of nearest point.
            let record = this.sight;
            for (let wall of walls) {   // We need to find closest wall to create shadow.
                const pt = ray.cast(wall);
                if (pt) {
                    const dist = p5.Vector.dist(this.pos, pt);                    
                    if (dist < record && dist < this.sight) {
                        record = dist;
                        closest = pt;
                    }
                }
            }
            if (record < 5)    // Hitting the wall.
                this.dead = true;
            inputs[i] = map(record, 0, 50, 1, 0);   // 1 => when close to wall.
            if (closest && showRaysCB.checked()) {
                stroke(255, 200);
                line (this.pos.x, this.pos.y, closest.x, closest.y)
            }            
        }   // End of i loop.

        // -------------------- CORE OF PROJECT -------------------------------
        const outputs = this.brain.predict(inputs);
        let angle = map(outputs[0], 0, 1, -PI, PI);
        let speed = map(outputs[1], 0, 1, 0, this.maxSpeed);
        angle += this.vel.heading();
        const steering = p5.Vector.fromAngle(angle);
        steering.setMag(speed);   
        steering.sub(this.vel);
        steering.limit(this.maxForce);
        this.applyForce(steering);
        currentSpeed = speed*10;
        // currentSpeed = this.vel.mag();
        // console.log(outputs); 
    } // End of wall function.

    update () {
        if (!this.dead && !this.finished) {
            this.pos.add(this.vel);
            this.vel.add(this.acc);
            this.vel.limit(this.maxSpeed);
            this.acc.set(0, 0);    // Clear the acceleration. 
            this.counter++;
            if (this.counter > LIFESPAN) {
                this.dead = true;
            }
            // Update the tentacles of car.
            for (let i = 0; i < this.rays.length; i++)
                this.rays[i].rotate(this.vel.heading())
        }
    }  // End of update function.

    applyForce (force) {
        // Accumulate all the forces into acceleration each time step and then update the velocity and position.
        this.acc.add(force);
    }   // End of applyForce function.

    check (checkpoints) {   
        if (!this.finished) {
            this.goal = checkpoints[this.index];
            const d = pldistance(this.goal.a, this.goal.b, this.pos.x, this.pos.y);
            if (d < 5) {
                if (audioCB.checked() && this.index == checkpoints.length - 1)
                    ding.play();
                this.fitness++;
                this.index = (this.index + 1) % checkpoints.length;
                this.counter = 0;
            }
        }
    }  // End of check function.

    calculateFitness () {
        this.fitness = pow(2, this.fitness);         
    }   // End of calculateFitness function.

    dispose () {
        this.brain.dispose();
    }   // End of dispose function.

    mutate () {
        this.brain.mutate(MUTATION_RATE);
    }   // End of mutate function.

    bounds () {
        if (this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0)
            this.dead = true;
    }   // End of bounds.

    highlight () {
        push();
        translate(this.pos.x, this.pos.y);
        const heading = this.vel.heading();
        rotate (heading);
        stroke(0, 255, 0);  // Green.
        fill(0, 255, 0);    // Green.
        rectMode(CENTER);
        rect(0, 0, 20, 10);
        //image(carIcon, 0, 0);
        pop();
        // for (let ray of this.rays)
        //     ray.show();
        if (this.goal  && showGoalsCB.checked())
            this.goal.show();
    }   // End of highlight function.
} // End of particle.