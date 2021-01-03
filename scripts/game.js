/**
    The Trial of Tim
    Javascript Game Demo
    Top-Down Adventure World Game
    @author Ben Borkowski
    @publisher Opal Games
**/

var options = {};
options.resizeGame = true;
options.screen = {};
options.screen.width = 960;
options.screen.height = 640;
options.grid = {}
options.grid.tileSize = 64;
options.grid.spriteFrameSize = 64;
options.grid.width = 15;
options.grid.height = 10;
options.showHitBoxes = false;

var state = {
    gameState : null, //'game','death','win'
    points : 0
};

var ticks = 0;
var lastTick = 0;
var world = null;

// optional create the canvas
// var canvas = document.createElement("canvas");
var w = window;
var canvas = document.getElementById('game-canvas');
var ctx = canvas.getContext("2d");
canvas.width = options.screen.width;
canvas.height = options.screen.height;
canvas.id = 'game-canvas';

var then = performance.now();

if(options.resizeGame == true){
    resizeGame();
    window.addEventListener('resize', resizeGame, false);
    window.addEventListener('orientationchange', resizeGame, false);
}

//requestAnimationFrame for all browsers
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

////////////
// * Initialize the Game
////////////

var init = function(){
    //test world data
    var worldData = null;
    getJSON('data/data.php',
    function(err, data) {
        if (err !== null) {
            alert('Something went wrong: ' + err);
        } else {
            //todo fix up init, for now start the game after the data is loaded.
            console.log('got some data');
            console.log(data);
            worldData = data;
            world = new worldFactory(3,3);
            console.log('here is the hard coded world');
            console.log(world);
            buildWorld();
            buildWorldData(worldData);
            resetHero();
            resetMonster();
            main();
        }
    });
}

////////////
// * MAIN LOOP
////////////

var main = function () {
    var now = Date.now();
    var delta = now - then;
    modifier = delta / 1000; //modifier in seconds
    update(modifier);
    render();
    then = now;
    requestAnimationFrame(main);
}

////////////
// * KEYBOARD CONTROLS
////////////

var keysDown = {};

addEventListener("keydown", function (e) {
    e.preventDefault();
    //clearMoveKeys();
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    e.preventDefault();
    delete keysDown[e.keyCode];
}, false);

//not used now
var clearMoveKeys = function(){
    delete keysDown[38];
    delete keysDown[40];
    delete keysDown[37];
    delete keysDown[39];
    delete keysDown[87];
    delete keysDown[83];
    delete keysDown[65];
    delete keysDown[68];
}

////////////
// * GAME RESOURCES / IMAGES
////////////

    // Background image
    var bgReady = false;
    var bgImage = new Image();
    bgImage.src = 'images/tile-01.png';
    bgImage.onload = function(){
        bgReady = true;
    }
    
    // Hero image
    var heroReady = false;
    var heroImage = new Image();
    heroImage.onload = function () {
        heroReady = true;
    }
    heroImage.src = "images/hero-skin-sprite.png";
    
    // Sword image
    var swordReady = false;
    var swordImage = new Image();
    swordImage.onload = function () {
        swordReady = true;
    }
    swordImage.src = "images/sword-sprite.png";
    
    // Monster image
    var monsterReady = false;
    var monsterImage = new Image();
    monsterImage.onload = function () {
        monsterReady = true;
    }
    monsterImage.src = "images/monster-001-sprite.png";

////////////
// * GAME OBJECTS
////////////

var monsters = [];

var hero = {
    speed: 180, // movement in pixels per second
    x: 0,
    y: 0,
    attack : false,
    attacking : false,
    lastAttack : null,
    canAttack : true,
    curDirection : 'd',
    hitBox : {w:40,h:40,offset:12},
    status : 'alive', //'alive','dead'
    lastGoodX : 0,
    lastGoodY : 0,
    moveTargetX : null,
    moveTargetY : null
};

var sword = {
    x: 0,
    y: 0,
    w: 10,
    h: 10
}

var makeMonster = function(){
    var monster = {
        x: 0,
        y: 0,
        velX : 0,
        velY : 0,
        speed : 150,
        status : 'alive', //alive, dead
        frame : 1, //the frame of the animation, 1 or 2, 3 for death
        deathTime : null,
        hitBox : {w:40,h:40,offset:12},
    };
    //todo fix get random tile
    //was 1-15, 1-10
    monster.x = ranomdNumberRange(3,13) * options.grid.tileSize - options.grid.tileSize;
    monster.y = ranomdNumberRange(3,8) * options.grid.tileSize - options.grid.tileSize;
    return monster;
}

////////////
// * WORLD AND SCREENS
////////////

const worldFactory = function(cols,rows) {
    var world = [];
    var screen = null;
    var iCol = 0;
    var iRow = 0;
    var num = 0;
    var id = 0;
    for( iRow; iRow < rows; iRow++ ) {
        for( iCol; iCol < cols; iCol++ ) {
            num++;
            screen = screenFactory( id, num, iCol, iRow );
            world.push(screen);
            id++;
        }
        iCol = 0;
    }
    return world;
}

const screenFactory = function(id,num,col,row) {
    var screen = {
        id : id,
        num : num,
        col : col,
        row : row,
        isCurrent : false,
        contains : {},
        tiles : []
    };
    return screen;
}

const tileFactory = function(num,col,row,tileType,x,y,color) {
    var tile = {
        num : num,
        col : col,
        row : row,
        tileType : tileType,
        contains : [], // reference to sprite in game list
        ui : {
            x : x,
            y : y,
            color : color,
        }
    };
    tile.ui = setUi(x,y,options.grid.tileSize,options.grid.tileSize,color,0,0,0);
    if(tile.tileType === 'tile'){
        tile.ui.image.src = 'images/tile-01.png';
    }
    if(tile.tileType === 'bush'){
        tile.ui.image.src = 'images/tile-bush.png';
    }
    if(tile.tileType === 'rock'){
        tile.ui.image.src = 'images/tile-rock.png';
    }
    if(tile.tileType === 'door'){
        tile.ui.image.src = 'images/tile-door.png';
    }
    return tile;
}

//set the starting screen and fill in a world obj with contents
const buildWorld = function(){
    
    state.gameState = 'game';
    world[7].isCurrent = true;
    
    var i = 0;
    var loopLength = world.length;
    var screenNum = 0;
    var numberOfMonsters = 1;
    for(i = 0; i < loopLength; i++) {
        screenNum = i + 1;
        
        switch(screenNum){
            case 1:
                numberOfMonsters = 5;
            break;
            case 2:
                numberOfMonsters = 4;
            break;
            case 3:
                numberOfMonsters = 5;
            break;
            case 4:
                numberOfMonsters = 3;
            break;
            case 5:
                numberOfMonsters = 2;
            break;
            case 6:
                numberOfMonsters = 3;
            break;
            case 7:
                numberOfMonsters = 2;
            break;
            case 8:
                numberOfMonsters = 0;
            break;
            case 9:
                numberOfMonsters = 2;
            break;
        }
        
        world[i].contains = {
            startingNumberOfMonsters : numberOfMonsters,
            numberOfMonsters : numberOfMonsters
        }
    }
}

//loop the world obj and build each screen with tileFactory
const buildWorldData = function(data){
    var screenData = data.world.screens;
    var i = 0; //screens
    var j = 0; //tiles
    var loopLength = world.length;
    var screenNum = 0;
    var tileData = null;
    for(i = 0; i < loopLength; i++) {
        world[i].tiles = screenData[i].tiles;
        for( j = 0; j < world[i].tiles.length; j++ ) {
            tileData = screenData[i].tiles[j];
            world[i].tiles[j] = tileFactory( tileData.num, tileData.col, tileData.row, tileData.tileType, tileData.col * options.grid.tileSize, tileData.row * options.grid.tileSize, null );
        }
    }
    console.log('done building world');
    console.log(world);
}

////////////
// * GAME HELPER FUNCTIONS
////////////

var cl = function(msg){
    console.log(msg);
}

var setUi = function (x,y,w,h,color,ox,oy,io){
    return{
        x : x,
        y : y,
        size : {w:w,h:h},
        color : color,
        image : new Image(),
        shapeOffset : {x:ox,y:oy},
        imageOffset : io,
    }
}

var ranomdNumberRange = function(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//reset the game for a new try
var resetGame = function(){
    state.points = 0;
    buildWorld();
    resetHero();
    resetMonster();
}

//reset the monsters for the current screen
var resetMonster = function () {
    monsters = [];
    var monster = null;
    var screenNum = getCurrentScreenNum();
    var screenId = getCurrentScreenId();
    var numberOfMonsters = world[screenId].contains.numberOfMonsters;
    for(i = 0; i < numberOfMonsters; i++){
        monster = makeMonster();
        monsters.push(monster);
    }
}

var resetHero = function () {
    var currentScreenId = getCurrentScreenId();
    world[currentScreenId].isCurrent = false;
    world[7].isCurrent = true;
    hero.status = 'alive';

    //hero.x = ranomdNumberRange(2,14) * options.grid.tileSize - options.grid.tileSize;
    //hero.y = ranomdNumberRange(2,9) * options.grid.tileSize - options.grid.tileSize;
    //todo find an empty tile in the current screen
    hero.x = 8 * options.grid.tileSize - options.grid.tileSize;
    hero.y = 5 * options.grid.tileSize - options.grid.tileSize;

}

//see if there is a screen on the world map to move to
//return the screen id
var checkScreen = function( direction ){
    var i = 0;
    var screenNum = null;
    var loopLength = world.length;
    var currentScreenId = getCurrentScreenId();
    var currentScreen = world[currentScreenId];
    for(i = 0; i < loopLength; i++) {
        screenNum = i + 1;
        switch(direction){
            case 'down':
                if( 
                    currentScreen.col == world[i].col &&
                    currentScreen.row == world[i].row - 1
                ){
                    return screenNum;
                }
            break;
            case 'right':
                if( 
                    currentScreen.row == world[i].row &&
                    currentScreen.col == world[i].col - 1
                ){
                    return screenNum;
                }
            break;
            case 'up':
                if( 
                    currentScreen.col == world[i].col &&
                    currentScreen.row == world[i].row + 1
                ){
                    return screenNum;
                }
            break;
            case 'left':
                if( 
                    currentScreen.row == world[i].row &&
                    currentScreen.col == world[i].col + 1
                ){
                    return screenNum;
                }
            break;
        }
    }
}

var moveScreen = function( moveToScreenId, direction ){
    moveToScreenId = moveToScreenId -1; //todo fix num vs id for 0 check
    var currentScreenId = getCurrentScreenId();
    hero.moveTargetX = null;
    hero.moveTargetY = null;
    switch(direction){
        case 'down':
            hero.y = 0;
        break;
        case 'right':
            hero.x = 0;
        break;
        case 'up':
            hero.y = canvas.height - options.grid.tileSize;
        break;
        case 'left':
            hero.x = canvas.width - options.grid.tileSize;
        break;        
    }
    world[currentScreenId].isCurrent = false;
    world[moveToScreenId].isCurrent = true;
    resetMonster();
}

var getCurrentScreenId = function(){
    var i = 0;
    var loopLength = world.length;
    for(i = 0; i < loopLength; i++) {
        if( world[i].isCurrent === true ){
            return i;
        }
    }
}

var getCurrentScreenNum = function(){
    var currentScreenId = getCurrentScreenId();
    return world[currentScreenId].num;
}

var checkMonstersLeft = function(){
    var i = 0;
    var loopLength = world.length;
    for(i = 0; i < loopLength; i++) {
        if( world[i].contains.numberOfMonsters > 0 ){
            return false;
        }
    }
    return true;
}

//show a screen slide, for winning or death
var showScreen = function(screenSlug){
    if(screenSlug == 'death'){
        state.gameState = 'death';
    }
    if(screenSlug == 'win'){
        state.gameState = 'win';
    }
}

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
}

var getTileFromPos = function(pos){
    var tileX = Math.floor(pos.x / options.grid.tileSize);
    var tileY = Math.floor(pos.y / options.grid.tileSize);
    
    console.log('------');
    console.log(tileX);
    console.log(tileY);
    console.log('------');
    
    if(tileX < 0 || tileY < 0){
        return true;
    }
    
    var j = ( (tileX) + ( (tileY) * options.grid.width ) ); //tileID

    var currentScreenId = getCurrentScreenId();
    var tile = world[currentScreenId].tiles[j];
    
    console.log(j);
    console.log(tile.tileType);
    
    if( tile.tileType == 'rock' || tile.tileType == 'bush' ){
        console.log('can not move there');
        return false;
    }else{
        console.log('CAN move there');
        return true;
    }
}

//JS game resize for full screen
function resizeGame() {
    var gameArea = document.getElementById('game-area');
    var widthToHeight = 3 / 2;
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    var newWidthToHeight = newWidth / newHeight;

    if(newHeight > options.screen.height) newHeight = options.screen.height;
    if(newWidth > options.screen.width)  newWidth = options.screen.width;

    if (newWidthToHeight > widthToHeight) {
        // window width is too wide relative to desired game width
        newWidth = newHeight * widthToHeight;
        gameArea.style.height = newHeight + 'px';
        gameArea.style.width = newWidth + 'px';
    } else { // window height is too high relative to desired game height
        newHeight = newWidth / widthToHeight;
        gameArea.style.width = newWidth + 'px';
        gameArea.style.height = newHeight + 'px';
    }

    canvas.width = newWidth;
    canvas.height = newHeight;
}

////////////
// * START THE GAME
////////////

init();