class Boundary {
    constructor (x1, y1, x2, y2) {
        this.a = createVector(x1, y1);
        this.b = createVector(x2, y2);
    }

    /**
     * API's: show, midpoint
     */
    show () {
        stroke(255);
        strokeWeight(1)
        line(this.a.x, this.a.y, this.b.x, this.b.y);   // Simply draw a line.
    }

    midpoint () {
        return createVector((this.a.x + this.b.x)*0.5, (this.a.y + this.b.y)*0.5)
    }
}   // End of class.