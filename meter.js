class Meter {
    constructor (x, y) {
        this.pos = createVector(x, y);
        this.pinLength = PIN_LENGTH;
        this.rays = [];
        for (let angle = -180; angle < 10; angle += 15)
            this.rays.push(new MeterRay(this.pos, radians(angle), this.pinLength));
    }   // End of constructor.

    /**
     * API's: show
     */
    show () {
        let speed = currentSpeed;
        let a = map(speed, 1, 50, -170, 10);
        let r = new MeterRay (this.pos, radians(a), this.pinLength - 10);
        fill(255);
        ellipse(this.pos.x, this.pos.y, 2, 2);
        for (let ray of this.rays)
            ray.show();
        r.highlight();
    }   // End of show function.
}       // End of class.