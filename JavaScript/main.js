// Make JavaScript sort of strongly typed
"use strict";

// Add Pixi to the canvas
const app = new PIXI.Application(600, 600);
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;
const tileSize = 50;
//red, orange, yellow, green, cyan, purple, pink
const colorArray = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x00FFFF, 0x9400D3, 0xFF00FF];

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
let exitTile;
let startIndex;
let baseColor;
let playerColor;

let player;
let keysDown = {};      //Is the key at this index (code) currently down?
let downLastFrame = {}; //Was the key at this index (code) down last frame?
let levelNum = 1;       //Keeps track of what level we are on.

// preload images, then fire setup function
PIXI.loader.
    add(["Media/Brio-Sprite.png", "Media/Tile-Sprite.png", "Media/Exit-Sprite.png"]).
    on("progress", e => { console.log(`|| ${Math.round(e.progress)}% loaded ||`) }).
    load(setup)
    ;

// --- Functions --- \\

// Set up everything needed to run the game at start
function setup() {
    // Assign player sprite image, set anchor to center of sprite, but don't add them to the scene yet
    player = new PIXI.Sprite.from("Media/Brio-Sprite.png");
    player.anchor.set(0.5);

    // Load the starting level up, player is added in here
    LoadLevel(new Index(5, 5), new Index(gridSize - 1, gridSize - 1), undefined);

    // When user presses / releases a key, fire these functions
    window.addEventListener("keydown", onKeysDown);
    window.addEventListener("keyup", onKeysUp);

    // Attach update function to built in ticker; fires every frame
    app.ticker.add(update);
}

// Update fires every frame; it's where basic game logic and whatnot updates!
function update() {
    // Checks if the exit tile is colored, and if so, if every tile is colored
    // Slightly redundant, but this structure prevents premature level endings
    if (exitTile.isColored) {
        if (isGridColored()) {
            console.log("Initiate level end");
        }
        else {
            ResetLevel();
        }
    }

    // Checks if player cannot move, and if so, if the level is not complete
    if (isPlayerTrapped() && !isGridColored()) {
        // Lose code and stuff, for now just resets the level
        ResetLevel();
    }
}

// Loads a level with all the given parameters.
function LoadLevel(playerIndex, exitIndex, gapIndexArray) {
    // First of all, reset the scene, so we have a fresh start to load onto.
    ClearScene();

    // Next, decide what the base and player color will be.
    baseColor = colorArray[0];
    playerColor = colorArray[3];

    // Set the amount of offset from the edges of the scene the grid has
    // Currently set to be centered on the scene
    let gridXOffset = (sceneWidth / 2) - ((gridSize * tileSize) / 2) + tileSize / 2;
    let gridYOffset = (sceneHeight / 2) - ((gridSize * tileSize) / 2) + tileSize / 2;

    // For each column of the grid, make an array inside the macro array
    for (let x = 0; x < gridSize; x++) {
        gridTiles[x] = [];

        // For every row of above column, add a new tile to that spot
        for (let y = 0; y < gridSize; y++) {
            // The grid offset is the starting position of the grid. The position is then shifted over by
            // however many tiles we're currently at in this for loop.
            gridTiles[x][y] = new Tile(
                tileSize,
                gridXOffset + tileSize * x,
                gridYOffset + tileSize * y,
                baseColor
            );

            // Once we've positioned the new tile, add it to the stage.
            app.stage.addChild(gridTiles[x][y]);
        }
    }

    // Now that we've made the grid, we need to adjust some tiles

    // First, make all the tiles at the indices inside gapIndexArray not traversable
    // !TODO!

    // Now make the exit tile, and put it at the specified index
    exitTile = gridTiles[exitIndex.x][exitIndex.y];
    let exitXPos = exitTile.x;
    let exitYPos = exitTile.y;
    exitTile = new Exit(
        tileSize,
        exitXPos,
        exitYPos,
        baseColor
    )
    gridTiles[exitIndex.x][exitIndex.y] = exitTile;
    app.stage.addChild(exitTile);

    // Finally, we add the player to the scene

    // Adjust player then place them on screen
    player.width = tileSize;
    player.height = tileSize;
    player.position = gridTiles[playerIndex.x][playerIndex.y].position;
    startIndex = new Index(playerIndex.x, playerIndex.y);
    player.tint = playerColor;
    app.stage.addChild(player);

    // The player's now on their starting tile, so update that tile to be their color.
    gridTiles[playerIndex.x][playerIndex.y].updateColor(true, baseColor, playerColor);
}

// Removes all children from the stage, giving us a clean slate.
// Thanks to https://www.html5gamedevs.com/topic/840-remove-all-children-from-a-stage/?do=findComment&comment=4707
// for the idea on how to do this.
function ClearScene() {
    for (let i = 0; i < app.stage.children.length - 1; i++) {
        app.stage.removeChild(app.stage.children[i]);
    }
}

function ResetLevel() {
    //go through all the tiles and set them to be uncolored, if they're visible
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (gridTiles[x][y].visible) {
                gridTiles[x][y].updateColor(false, baseColor, playerColor);
            }
        }
    }

    // Put the player back where they started and color that starting tile
    player.position = gridTiles[startIndex.x][startIndex.y].position;
    gridTiles[startIndex.x][startIndex.y].updateColor(true, baseColor, playerColor);
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

        // Gets the tile at the new position and only moves the player / updates tint if said tile exists.
        // Also disallows backtracking over tiles that are already colored.
        let moveIndex = getIndexAtCoords(player.x + amount, player.y);
        let tileMovedOnto = moveIndex ? gridTiles[moveIndex.x][moveIndex.y] : null;
        if (tileMovedOnto && !tileMovedOnto.isColored) {
            player.x += amount;

            tileMovedOnto.updateColor(true, baseColor, playerColor);
        }
    }
    else {
        // Gets the tile at the new position and only moves the player / updates tint if said tile exists.
        // Also disallows backtracking over tiles that are already colored.
        let moveIndex = getIndexAtCoords(player.x, player.y + amount);
        let tileMovedOnto = moveIndex ? gridTiles[moveIndex.x][moveIndex.y] : null;
        if (tileMovedOnto && !tileMovedOnto.isColored) {
            player.y += amount;

            tileMovedOnto.updateColor(true, baseColor, playerColor);
        }
    }
}

function isInBounds(xPosToCheck, yPosToCheck) {
    let minTile = gridTiles[0][0];
    let maxTile = gridTiles[gridSize - 1][gridSize - 1];

    // If the given xpos / ypos is greater than the maximum grid x / y, the position is out of bounds
    if (xPosToCheck > maxTile.x || yPosToCheck > maxTile.y) {
        return false;
    }

    // If the given xpos / ypos is less than the minimum grid x / y, the position is out of bounds
    else if (xPosToCheck < minTile.x || yPosToCheck < minTile.y) {
        return false;
    }

    // If we've gotten this far, the tile's in the bounds of the grid.
    return true;
}

// Checks to see if the player can't move.
function isPlayerTrapped() {
    // First, get the current index of the player.
    let currentIndex = getIndexAtCoords(player.x, player.y);

    // Next, set references to all the tiles around the player. If the indices are out of range, set the ref to null.
    let leftInd = currentIndex.x < 1 ? null : gridTiles[currentIndex.x - 1][currentIndex.y];
    let rightInd = currentIndex.x >= gridSize - 1 ? null : gridTiles[currentIndex.x + 1][currentIndex.y];
    let upInd = currentIndex.y < 1 ? null : gridTiles[currentIndex.x][currentIndex.y - 1];
    let downInd = currentIndex >= gridSize - 1 ? null : gridTiles[currentIndex.x][currentIndex.y + 1];

    // Now check and see if there are any tiles the player can move to.
    // We do this by checking if each tile around the player exists and isn't colored. If so, the player can move.
    if (leftInd && !leftInd.isColored) {
        return false;
    }
    if (rightInd && !rightInd.isColored) {
        return false;
    }
    if (upInd && !upInd.isColored) {
        return false;
    }
    if (downInd && !downInd.isColored) {
        return false;
    }

    // If none of the above tiles meet the criteria, the player can't move.
    return true;
}

// Gets a a tile on the grid from a pair of coordinates. Returns null if no tile at exists at given coords.
function getIndexAtCoords(xCoord, yCoord) {
    // Before we do any looping, check to see if the coords are out of bounds. Bail out early if so.
    if (!isInBounds(xCoord, yCoord)) {
        return null;
    }

    // For every column of the grid,
    for (let x = 0; x < gridTiles.length; x++) {

        // Check if the xcoord matches.
        if (gridTiles[x][0].comparePositions(xCoord, null)) {

            // Once we've found an x that matches, go into the sub array and look for a y that matches.
            for (let y = 0; y < gridTiles[x].length; y++) {

                // Check if the y matches the position we're at, and if it does, return the tile here.
                if (gridTiles[x][y].comparePositions(xCoord, yCoord)) {
                    return new Index(x, y);
                }
            }

            // If we've gotten here, there is no tile that matches the given y. Return null.
            return null;
        }
    }

    // If we've gotten here, there is no tile that matches the given x. Return null.
    return false;
}

function isGridColored() {
    // Check if the exit tile is colored. If not, we don't need to check anything else
    if (!exitTile.isColored) { return false }

    // Check if any tile isn't colored. If it is, bail out and return false.
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (gridTiles[x][y].isColored == false) {
                return false;
            }
        }
    }

    // If there are no uncolored tiles, return true.
    return true;
}