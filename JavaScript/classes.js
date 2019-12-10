class Tile extends PIXI.Sprite {
    constructor(size, x = 0, y = 0, visible = true, tint = 0xFFFFFF) {
        super(PIXI.loader.resources["Media/Tile-Sprite.png"].texture);

        this.anchor.set(0.5, 0.5);
        this.width = size;
        this.height = size;
        this.x = x;
        this.y = y;
        this.visible = visible;         //can this tile be seen?
        this.canTraverse = visible;     //can this tile be moved onto? (If it's not visible, no)
        this.isColored = !this.visible; //has this tile been colored? (If not visible, can't be colored, so set to true for level end checking reasons)
        this.tint = tint;               //since Tiles are in greyscale, tint = the color of the tile
    }

    // Check if the given position is the same as this tile's position.
    // Passing in a false / falsy value to either parameter lets you check the other on its own.
    comparePositions(xToCompare, yToCompare) {
        xToCompare = xToCompare ? xToCompare : this.x;
        yToCompare = yToCompare ? yToCompare : this.y;

        return xToCompare === this.x && yToCompare === this.y
    };

    updateColorTint() {
        //If the tint is green, we turn it back to white/gray.
        if (this.tint == 0x00FF00) {
            this.tint = 0xFFFFFF;
            this.isColored = false;
        }
        //Else if it's not, we turn it to green.
        else {
            this.tint = 0x00FF00;
            this.isColored = true;
        }
    }
}

class Exit extends Tile {
    constructor(size, x = 0, y = 0, tint = 0xFFFFFF) {
        super(size, x, y, true, tint)

        this.texture = PIXI.loader.resources["Media/Exit-Sprite.png"].texture;
    }
}

class Index {
    constructor(x, y){
        if (isNaN(x)) {
            this.x = 0;
        }
        else {
            this.x = Math.trunc(x);
        }

        if (isNaN(y)) {
            this.y = 0;
        }
        else {
            this.y = Math.trunc(y);
        }
    }
}