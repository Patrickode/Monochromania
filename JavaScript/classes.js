class Tile extends PIXI.Sprite {
    constructor(size, x = 0, y = 0, canTraverse = true, tint = 0x888888) {
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
    }

    // Check if the given position is the same as this tile's position.
    // Passing in a false / falsy value to either parameter lets you check the other on its own.
    comparePositions(xToCompare, yToCompare) {
        xToCompare = xToCompare ? xToCompare : this.x;
        yToCompare = yToCompare ? yToCompare : this.y;

        return xToCompare === this.x && yToCompare === this.y
    };
}