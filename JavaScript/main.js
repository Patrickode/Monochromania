// Make JavaScript sort of strongly typed
"use strict";

// Add Pixi to the canvas
const app = new PIXI.Application(600, 600);
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

// Assign player sprite image, set anchor to center of sprite
let player = new PIXI.Sprite.from("Media/Brio-Sprite.png")
player.anchor.set(0.5);

// Place player on stage in the middle
player.x = sceneWidth / 2;
player.y = sceneHeight / 2;
app.stage.addChild(player);