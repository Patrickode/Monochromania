class Tile extends PIXI.Sprite {
    constructor(x = 0, y = 0, canTraverse = true) {
        // set the anchor to the bottom left; helps with cartesian coordinates
        this.anchor.set(0, 1);
        this.x = x;
        this.y = y;
        this.canTraverse = canTraverse;
        this.image = canTraverse ? "Media/Tile-Sprite.png" : "";

        super(PIXI.loader.resources[this.image].texture);
    }
}