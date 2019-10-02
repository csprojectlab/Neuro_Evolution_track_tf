class MeterRay {
    constructor (position, angle, pinLength) {
        this.pos = position;
        this.angle = angle;
        this.length = pinLength;
        this.dir = p5.Vector.fromAngle(angle);  // Creating a vector pointing to that angle.
    }       // End of constructor.

    /**
     * API's: show, highlight
     */
    show () {
        stroke(0, 0, 255);
        push ();
        translate(this.pos.x, this.pos.y);
        line (0, 0, this.dir.x * this.length, this.dir.y * this.length);
        ellipse(this.dir.x*this.length, this.dir.y*this.length, 4, 4);
        pop();
    }       // End of show function.

    highlight () {
        stroke(0, 255, 0);
        push ();
        translate(this.pos.x, this.pos.y);
        line (0, 0, this.dir.x * this.length, this.dir.y * this.length);
        ellipse(this.dir.x*this.length, this.dir.y*this.length, 4, 4)
        pop();
    }       // End of highlight.
}       // End of ray class.