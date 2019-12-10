class Tile extends PIXI.Sprite {
    constructor(size, x = 0, y = 0, canTraverse = true, tint = 0xFFFFFF) {
        super(PIXI.loader.resources["Media/Tile-Sprite.png"].texture);

        this.anchor.set(0.5, 0.5);
        this.width = size;
        this.height = size;
        this.x = x;
        this.y = y;
        this.canTraverse = canTraverse; //can this tile be moved onto?
        this.tint = tint;               //since Tiles are white, tint = the color of the tile

        // If the tile isn't traversable, it shouldn't be visible either
        // Think of it like a "gap" in the grid
        this.visible = canTraverse;

        //If there's a gap then we just automatically assume it's traversed for the sake of level checking later.
        if(this.visible == false)
        {
            this.isTraversed = true;
        }
        //Else we say that it isn't traversed yet.
        else{
            this.isTraversed = false;
        }
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
            this.isTraversed = false;
        }
        //Else if it's not, we turn it to green.
        else {
            this.tint = 0x00FF00;
            this.isTraversed = true;
        }
    }
}

class Exit extends Tile {
    constructor(size, x = 0, y = 0, tint = 0xFFFFFF) {
        super(size, x, y, true, tint)

        this.texture = PIXI.Texture.from("Media/Exit-Sprite.png");
    }
}