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

let makingLevel = false;
let resettingLevel = false;

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

    //make a random level
    MakeRandomLevel();

    // When user presses / releases a key, fire these functions
    window.addEventListener("keydown", onKeysDown);
    window.addEventListener("keyup", onKeysUp);

    // Attach update function to built in ticker; fires every frame
    app.ticker.add(update);
}

// Update fires every frame; it's where basic game logic and whatnot updates!
function update() {
    // If the grid is colored, and the player is on the exit, the level's been completed, make a new one
    if (isGridColored() && (player.x == exitTile.x && player.y == exitTile.y)) {
        // This section sets makingLevel to true to prevent additional calls, pauses for some milliseconds,
        // and once it's done pausing, makes a random level and sets makingLevel to false, since it's done now.
        if (!makingLevel) {
            makingLevel = true;
            window.setTimeout(
                function () {
                    MakeRandomLevel();
                    makingLevel = false;
                },
                1000
            );
        }
    }

    // Checks if player cannot move.
    if (isPlayerTrapped()) {
        // Only reset if the level is not complete.
        if (!((player.x == exitTile.x && player.y == exitTile.y) && isGridColored())) {
            // See makingLevel comment above. Pauses for some milliseconds, and resets the level, preventing extra calls.
            if (!resettingLevel) {
                resettingLevel = true;
                window.setTimeout(
                    function () {
                        ResetLevel();
                        resettingLevel = false;
                    },
                    1000
                );
            }
        }
    }
}

// Loads a level with all the given parameters.
function LoadLevel(playerIndex, exitIndex, gapIndexArray) {
    // First of all, reset the scene, so we have a fresh start to load onto.
    ClearScene();

    // Next, set two random colors to be the base and player colors. Make sure player color is not the same as base color.
    let baseColorInd = randomInteger(0, colorArray.length);
    let playerColorInd = baseColorInd
    while (playerColorInd == baseColorInd) {
        playerColorInd = randomInteger(0, colorArray.length);
    }

    baseColor = colorArray[baseColorInd];
    playerColor = colorArray[playerColorInd];

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

    // First, make all the tiles at the indices inside gapIndexArray into gaps
    for (let i = 0; i < gapIndexArray.length; i++) {
        gridTiles[gapIndexArray[i].x][gapIndexArray[i].y].setGap(true);
    }

    // Now make the exit tile, and put it at the specified index
    // If this overlaps with a gap, it doesn't matter, because we're overwriting it
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

    // The player's now on their starting tile, so update that tile to be their color, and make it not be a gap if it is one.
    gridTiles[playerIndex.x][playerIndex.y].setGap(false);
    gridTiles[playerIndex.x][playerIndex.y].updateColor(true, baseColor, playerColor);
}

function MakeRandomLevel() {
    // Set player and exit index to random indices. Make sure player index is not the exit index.
    let exitIndX = randomInteger(0, gridSize);
    let exitIndY = randomInteger(0, gridSize);
    let playIndX = exitIndX;
    let playIndY = exitIndY;

    while (playIndX == exitIndX && playIndY == exitIndY) {
        playIndX = randomInteger(0, gridSize);
        playIndY = randomInteger(0, gridSize);
    }

    let exitInd = new Index(exitIndX, exitIndY);
    let playInd = new Index(playIndX, playIndY);

    // Set a random number of gaps, for that many gaps, make a random index.
    let numGaps = randomInteger(0, 5);
    let gapInds = [];
    for (let i = 0; i < numGaps; i++) {
        gapInds[i] = new Index(randomInteger(1, gridSize - 1), randomInteger(1, gridSize - 1))
    }

    // Load the starting level up, player is added in here
    LoadLevel(playInd, exitInd, gapInds);
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
        // Also disallows backtracking over tiles that are already colored and moving onto gaps.
        let moveIndex = getIndexAtCoords(player.x + amount, player.y);
        let tileMovedOnto = moveIndex ? gridTiles[moveIndex.x][moveIndex.y] : null;
        if (tileMovedOnto && tileMovedOnto.canTraverse) {
            player.x += amount;

            tileMovedOnto.updateColor(true, baseColor, playerColor);
        }
    }
    else {
        // Gets the tile at the new position and only moves the player / updates tint if said tile exists.
        // Also disallows backtracking over tiles that are already colored and moving onto gaps.
        let moveIndex = getIndexAtCoords(player.x, player.y + amount);
        let tileMovedOnto = moveIndex ? gridTiles[moveIndex.x][moveIndex.y] : null;
        if (tileMovedOnto && tileMovedOnto.canTraverse) {
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
    // We do this by checking if each tile around the player exists and can be traversed. If so, the player can move.
    if (leftInd && leftInd.canTraverse) {
        return false;
    }
    if (rightInd && rightInd.canTraverse) {
        return false;
    }
    if (upInd && upInd.canTraverse) {
        return false;
    }
    if (downInd && downInd.canTraverse) {
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

// Returns whether the whole grid, besides the exit tile, is colored.
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

// Get a random integer between min (inclusive) and max (exclusive).
// Thanks to https://www.w3schools.com/js/js_random.asp for reminding / reteaching me how to do this.
function randomInteger(min, max) { return Math.floor(Math.random() * (max - min)) + min; }