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
const WKey = 87;
const AKey = 65;
const SKey = 83;
const DKey = 68;

const UpKey = 38;
const LeftKey = 37;
const DownKey = 40;
const RightKey = 39;
// #endregion

// Script scope variables
let keysDown = {};      //Is the key at this code currently down?
let downLastFrame = {}; //Was the key at this code down last frame?

// Assign player sprite image, set anchor to center of sprite
let player = new PIXI.Sprite.from("Media/Brio-Sprite.png")
player.anchor.set(0.5);

// Adjust player then place them on screen
player.width = tileSize - 10;
player.height = tileSize - 10;
player.x = sceneWidth / 2;
player.y = sceneHeight / 2;
app.stage.addChild(player);

// When user presses / releases a key, fire these functions
window.addEventListener("keydown", onKeysDown);
window.addEventListener("keyup", onKeysUp);

// Attach update function to built in ticker; fires every frame
app.ticker.add(update);

// --- Functions --- \\

// Update fires every frame; it's where basic game logic and whatnot updates!
function update() {

}

// On key press, set the corresponding index to true
function onKeysDown(e) {
    keysDown[e.keyCode] = true;

    downLastFrame[e.keyCode] = true;
}

// On key press, set the corresponding index to false
function onKeysUp(e) {
    keysDown[e.keyCode] = false;
    downLastFrame[e.keyCode] = true;
}