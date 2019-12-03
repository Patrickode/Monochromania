// Make JavaScript sort of strongly typed
"use strict";

// Add Pixi to the canvas
const app = new PIXI.Application(600, 600);
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
const tileSize = 50;

// #region Key Codes
const wKey = 87;
const aKey = 65;
const sKey = 83;
const dKey = 68;

const upKey = 38;
const leftKey = 37;
const downKey = 40;
const rightKey = 39;
// #endregion

// Script scope variables
let gridSize = 11;
let gridTiles = [];

let player;
let keysDown = {};      //Is the key at this index (code) currently down?
let downLastFrame = {}; //Was the key at this index (code) down last frame?

// preload images, then fire setup function
PIXI.loader.
    add(["Media/Brio-Sprite.png", "Media/Tile-Sprite.png"]).
    on("progress", e => { console.log(`|| ${e.progress}% loaded ||`) }).
    load(setup)
;

// --- Functions --- \\

// Set up everything needed to run the game at start
function setup() {
    // Set the amount of offset from the edges of the scene the grid has
    // Currently set to be centered on the scene
    let gridXOffset = (sceneWidth / 2) - ((gridSize * tileSize) / 2) + tileSize / 2;
    let gridYOffset = (sceneHeight / 2) - ((gridSize * tileSize) / 2) + tileSize / 2;
    // let gridYOffset = 0;

    // For each column of the grid, make an array inside the macro array
    for (let x = 0; x < gridSize; x++) {
        gridTiles[x] = [];

        // For every row of above column, add a new tile to that spot
        for (let y = 0; y < gridSize; y++) {
            // The grid offset is the starting position of the grid. The position is then shifted over by
            // however many tiles we're currently at in this for loop.
            gridTiles[x][y] = new Tile (
                tileSize,
                gridXOffset + tileSize * x,
                gridYOffset + tileSize * y,
                true
            );

            // Once we've positioned the new tile, add it to the stage.
            app.stage.addChild(gridTiles[x][y]);
        }
    }

    // Assign player sprite image, set anchor to center of sprite
    player = new PIXI.Sprite.from("Media/Brio-Sprite.png");
    player.anchor.set(0.5);

    // Adjust player then place them on screen
    player.width = tileSize;
    player.height = tileSize;
    player.x = sceneWidth / 2;
    player.y = sceneHeight / 2;
    app.stage.addChild(player);

    // When user presses / releases a key, fire these functions
    window.addEventListener("keydown", onKeysDown);
    window.addEventListener("keyup", onKeysUp);

    // Attach update function to built in ticker; fires every frame
    app.ticker.add(update);
}

// Update fires every frame; it's where basic game logic and whatnot updates!
function update() {

}

// On key press, set the corresponding index to true
function onKeysDown(e) {
    keysDown[e.keyCode] = true;

    GetMovementInput();

    downLastFrame[e.keyCode] = true;
}

// On key press, set the corresponding index to false
function onKeysUp(e) {
    keysDown[e.keyCode] = false;
    downLastFrame[e.keyCode] = false;
}

// Checks to see if WASD or an arrow key was just pressed, and if so, moves the player in that direction.
function GetMovementInput() {
    // Up and down movement
    if (keyPressed(wKey) || keyPressed(upKey)) {
        movePlayer(false, false);
    }
    else if (keyPressed(sKey) || keyPressed(downKey)) {
        movePlayer(false, true);
    }

    // Left and right movement
    else if (keyPressed(aKey) || keyPressed(leftKey)) {
        movePlayer(true, false);
    }
    else if (keyPressed(dKey) || keyPressed(rightKey)) {
        movePlayer(true, true);
    }
}

// Helper function that returns true if the given key was just pressed.
function keyPressed(keyCode) { return keysDown[keyCode] && !downLastFrame[keyCode] };

// Moves the player on the axis implied by isHorizontal, in the direction implied by isPositive.
function movePlayer(isHorizontal, isPositive) {
    // If positive movement, alter by tileSize. Otherwise, alter by negative tileSize.
    let amount = isPositive ? tileSize : -tileSize;

    // If moving horizontally, alter player.x. Otherwise, alter player.y.
    if (isHorizontal) {
        player.x += amount;
    }
    else {
        player.y += amount;
    }
}