// Make JavaScript sort of strongly typed
"use strict";

// Add Pixi to the canvas
const app = new PIXI.Application(600, 600);
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

const tileSize = 50;

// Assign player sprite image, set anchor to center of sprite
let player = new PIXI.Sprite.from("Media/Brio-Sprite.png")
player.anchor.set(0.5);

// Adjust player then place them on screen
player.width = tileSize - 10;
player.height = tileSize - 10;
player.x = sceneWidth / 2;
player.y = sceneHeight / 2;
app.stage.addChild(player);