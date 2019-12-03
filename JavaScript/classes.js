class Tile extends PIXI.Sprite.from {
    constructor(x = 0, y = 0, canTraverse = true, tint = 0xFFFFFF) {
        // set the anchor to the bottom left; helps with cartesian coordinates
        super("Media/Tile-Sprite.png");

        this.anchor.set(0, 1);
        this.x = x;
        this.y = y;
        this.canTraverse = canTraverse;
        this.tint = tint;
    }
}