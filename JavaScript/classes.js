class Tile extends PIXI.Sprite {
    constructor(x = 0, y = 0, canTraverse = true, tint = 0xFFFFFF) {
        super(PIXI.loader.resources["Media/Tile-Sprite.png"].texture);
        
        this.anchor.set(0, 1);          //set the anchor to the bottom left; helps with cartesian coordinates
        this.x = x;
        this.y = y;
        this.canTraverse = canTraverse; //can this tile be moved onto?
        this.tint = tint;               //since Tiles are white, tint = the color of the tile

        // If the tile isn't traversable, it shouldn't be visible either
        this.visible = canTraverse;
    }
}