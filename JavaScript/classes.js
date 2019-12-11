class Tile extends PIXI.Sprite {
    constructor(size, x = 0, y = 0, tint = 0xFFFFFF, visible = true) {
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

    updateColor(colored, baseColor, playerColor) {
        //If the tile is being colored, make it the player color.
        if (colored) {
            this.isColored = true;
            this.tint = playerColor;
        }
        //If the tile is being "uncolored," turn it to the base color.
        else {
            this.isColored = false;
            this.tint = baseColor;
        }
    }
}

class Exit extends Tile {
    constructor(size, x = 0, y = 0, tint = 0xFFFFFF) {
        super(size, x, y, tint, true)

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