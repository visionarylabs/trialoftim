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

/*create the canvas*/
//var canvas = document.createElement("canvas");
var canvas = document.getElementById('game-canvas');
var ctx = canvas.getContext("2d");
canvas.width = options.screen.width;
canvas.height = options.screen.height;
canvas.id = 'game-canvas';

var then = performance.now();

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
if(options.resizeGame == true){
    resizeGame();
    window.addEventListener('resize', resizeGame, false);
    window.addEventListener('orientationchange', resizeGame, false);
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
    };
    heroImage.src = "images/hero-skin-sprite.png";
    
    // Sword image
    var swordReady = false;
    var swordImage = new Image();
    swordImage.onload = function () {
        swordReady = true;
    };
    swordImage.src = "images/sword-sprite.png";
    
    // Monster image
    var monsterReady = false;
    var monsterImage = new Image();
    monsterImage.onload = function () {
        monsterReady = true;
    };
    monsterImage.src = "images/monster-001-sprite.png";

////////////
// * GAME OBJECTS
////////////

var monsters = [];

var hero = {
    speed: 256, // movement in pixels per second
    x: 0,
    y: 0,
    attack : false,
    attacking : false,
    lastAttack : null,
    canAttack : true,
    lastDirection : 'd',
    hitBox : {w:40,h:40,offset:12},
    status : 'alive' //'allive','dead'
};

var sword = {
    x:0,
    y:0,
    w: 10,
    h: 10
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
        contains : {}
    };
    return screen;
};

//fill in a world map with screen types and contents
//set the starting screen
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
                numberOfMonsters = 1;
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

////////////
// * KEYBOARD CONTROLS
////////////

var keysDown = {};

addEventListener("keydown", function (e) {
    e.preventDefault();
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    e.preventDefault();
    delete keysDown[e.keyCode];
}, false);

////////////
// * GAME HELPER FUNCTIONS
////////////

var ranomdNumberRange = function(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var cl = function(msg){
    console.log(msg);
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
};

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
        hitBox : {w:40,h:40,offset:12}
    };
    //todo fix get random tile
    //was 1-15, 1-10
    monster.x = ranomdNumberRange(3,13) * options.grid.tileSize - options.grid.tileSize;
    monster.y = ranomdNumberRange(3,8) * options.grid.tileSize - options.grid.tileSize;
    return monster;
}

var resetHero = function () {
    var currentScreenId = getCurrentScreenId();
    world[currentScreenId].isCurrent = false;
    world[7].isCurrent = true;
    hero.status = 'alive';
    hero.x = ranomdNumberRange(2,14) * options.grid.tileSize - options.grid.tileSize;
    hero.y = ranomdNumberRange(2,9) * options.grid.tileSize - options.grid.tileSize;
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

////////////
// * Initialize the Game
////////////

var init = function(){
    world = new worldFactory(3,3);
    buildWorld();
    resetHero();
    resetMonster();
    main();
};

////////////
// * UPDATE
////////////

var update = function (modifier) {

    //death screen state
    if(state.gameState == 'death' || state.gameState == 'win'){
        if (27 in keysDown || 13 in keysDown) { // Player holding esc or return
            resetGame();
        }
    }

    //game play update, return if not in game state
    if(state.gameState !== 'game') return;
    
    var currentScreenId = getCurrentScreenId();
    if (38 in keysDown || 87 in keysDown) { // Player holding up or w
        if(hero.attacking == false){
            hero.y -= hero.speed * modifier;
            hero.lastDirection = 'u';
        }
    }
    if (40 in keysDown || 83 in keysDown) { // Player holding down or s
        if(hero.attacking == false){
            hero.y += hero.speed * modifier;
            hero.lastDirection = 'd';
        }
    }
    if (37 in keysDown || 65 in keysDown) { // Player holding left or a
        if(hero.attacking == false){
            hero.x -= hero.speed * modifier;
            hero.lastDirection = 'l';
        }
    }
    if (39 in keysDown || 68 in keysDown) { // Player holding right or d
        if(hero.attacking == false){
            hero.x += hero.speed * modifier;
            hero.lastDirection = 'r';
        }
    }
    if (32 in keysDown || 16 in keysDown) { // Player holding space or shift
        if(hero.attacking == false && hero.canAttack == true){
            hero.attack = true;
            hero.lastAttack = then;
            hero.attacking = true;
            hero.canAttack = false;
        }
    }

    //attack check
    if(then - hero.lastAttack > ( 300) ){
        hero.attack = false;
        hero.attacking = false;
    }
    if(then - hero.lastAttack > ( 500 ) ){
        hero.canAttack = true;
    }

    // SWORD
    var swordLong = (options.grid.tileSize / 3) * 2;
        swordLong = 64;
    var swordShort = options.grid.tileSize / 4;
    var halfTile = options.grid.tileSize / 2;
    var eigthTile = options.grid.tileSize / 8;

    if(hero.lastDirection == 'u'){
        sword.h = swordLong;
        sword.w = swordShort;
        sword.x = hero.x + halfTile - eigthTile;
        sword.y = hero.y - swordLong;
        sword.spriteX = hero.x;
        sword.spriteY = hero.y - options.grid.spriteFrameSize;
    }
    if(hero.lastDirection == 'd'){
        sword.h = swordLong;
        sword.w = swordShort;
        sword.x = hero.x + halfTile - eigthTile;
        sword.y = hero.y + options.grid.spriteFrameSize;
        sword.spriteX = hero.x;
        sword.spriteY = hero.y + options.grid.spriteFrameSize;
    }
    if(hero.lastDirection == 'l'){
        sword.w = swordLong;
        sword.h = swordShort;
        sword.x = hero.x - swordLong;
        sword.y = hero.y + halfTile - eigthTile;
        sword.spriteX = hero.x - options.grid.spriteFrameSize;
        sword.spriteY = hero.y;
    }
    if(hero.lastDirection == 'r'){
        sword.w = swordLong;
        sword.h = swordShort;
        sword.x = hero.x + options.grid.spriteFrameSize;
        sword.y = hero.y + halfTile - eigthTile;
        sword.spriteX = hero.x + options.grid.spriteFrameSize;
        sword.spriteY = hero.y;
    }

    /**
        EDGE TEST
        HERO ON EDGE
        MOVE TO SCREEN IF POSSILBE
    **/
    // X Edge
    var moveToScreenId = null;
    if (hero.x > canvas.width - options.grid.spriteFrameSize) {  //right edge
        if( moveToScreenId = checkScreen('right') ){
            moveScreen(moveToScreenId,'right');
        }else{
            hero.x = canvas.width - options.grid.spriteFrameSize;
        }
    }else if (hero.x < 0) { //left edge
        if( moveToScreenId = checkScreen('left') ){
            moveScreen(moveToScreenId,'left');
        }else{
            hero.x = 0;
        }
    }
    // Y Edge
    if (hero.y > canvas.height - options.grid.spriteFrameSize) { //bottom edge
        if( moveToScreenId = checkScreen('down') ){
            moveScreen(moveToScreenId,'down');
        }else{
            hero.y = canvas.height - options.grid.spriteFrameSize;
        }
    }else if (hero.y < 0) { //top edge
        if( moveToScreenId = checkScreen('up') ){
            moveScreen(moveToScreenId,'up');
        }else{
            hero.y = 0;
        }
    }

    /* MONSTER UPDATE LOOP */
    // move enemies
    var monsterCheckNum = 0;
    if(monsters.length <= 0) return;
    for(monsterCheckNum = monsters.length - 1; monsterCheckNum >= 0; monsterCheckNum--){
        var monster = monsters[monsterCheckNum];
        if(monster.status == 'alive'){
            //switch monster movement
            var monsterSwitchChance = ranomdNumberRange(1,300);
            if(monsterSwitchChance < 2){
                monster.velX = 1;
            }else if(monsterSwitchChance < 4){
                monster.velX = -1;
            }else if(monsterSwitchChance < 6){
                monster.velY = 1;
            }else if(monsterSwitchChance < 8){
                monster.velY = -1;
            }else if(monsterSwitchChance < 10){
                monster.velY = 0;
            }else if(monsterSwitchChance < 12){
                monster.velY = 0;
            }
            //move the monster
            monster.x += monster.velX * monster.speed * modifier;
            monster.y += monster.velY * monster.speed * modifier;
        }

        // HIT TEST // ATTACK HITS // Monster Dies
        if (
            hero.attack == true
            && sword.x <= (monster.x + options.grid.tileSize)
            && monster.x <= (sword.x + options.grid.tileSize)
            && sword.y <= (monster.y + options.grid.tileSize)
            && monster.y <= (sword.y + options.grid.tileSize)
            && monster.status == 'alive'
        ) {
            state.points++;
            monster.frame = 3; //3 = death frame
            monster.status = 'dead';
            monster.deathTime = then;
            world[currentScreenId].contains.numberOfMonsters--;
            //check for win{
            if( checkMonstersLeft() === true ){
                showScreen('win');
                return;
            }
        }

        // EDGE TEST // turn monster on edge
        if (monster.x >= canvas.width - options.grid.spriteFrameSize) {
            monster.x = canvas.width - options.grid.spriteFrameSize;
            monster.velX = -1;
        }
        else if (monster.x <= 0) {
            monster.x = 0;
            monster.velX = 1;
        }
        if (monster.y >= canvas.height - options.grid.spriteFrameSize) {
            monster.y = canvas.height - options.grid.spriteFrameSize;
            monster.velY = -1;
        }
        else if (monster.y <= 0) {
            monster.y = 0;
            monster.velY = 1;
        }

        // HIT TEST // hero touching monster // Hero Dies!
        if (
            hero.x + hero.hitBox.offset <= (monster.x + monster.hitBox.offset + monster.hitBox.w) //M width
            && monster.x + monster.hitBox.offset <= (hero.x + hero.hitBox.offset + hero.hitBox.w) //H width
            && hero.y + hero.hitBox.offset <= (monster.y + monster.hitBox.offset + monster.hitBox.h) //M height
            && monster.y + monster.hitBox.offset <= (hero.y + hero.hitBox.offset + hero.hitBox.h) //H height
            && monster.status == 'alive'
        ) {
            hero.status = 'dead';
            showScreen('death');
            return;
        }

    }//END MONSTER CHECK LOOP

    //set ticks
    if( (then - lastTick) > (250) ){
        lastTick = then;
        ticks++;
        //monster tick loop
        for(i=0;i<monsters.length;i++){
            //animate monster frame
            if(monsters[i].frame == 1){
                monsters[i].frame = 2;
            }else if(monsters[i].frame == 2){
                monsters[i].frame = 1;
            }
        }
    }
    
    //clean up destoryed monsters
    for(monsterCheckNum = monsters.length - 1; monsterCheckNum >= 0; monsterCheckNum--){
        if(monsters[monsterCheckNum].status == 'dead' && ( then - monsters[monsterCheckNum].deathTime > 250 ) ){
            monsters.splice(monsterCheckNum,1);
        }
    }

};

////////////
// * RENDER
////////////

var render = function () {

    //BG RENDER
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
        var ptrn = ctx.createPattern(bgImage, 'repeat');
        ctx.fillStyle = ptrn;
        ctx.fillRect(0, 0, canvas.width, canvas.height); // context.fillRect(x, y, width, height);
    }

    //sprite x frame based on d,r,u,l
    var spriteX = 0;
    var spriteY = 0;

    //MONSTER RENDER LOOP
    for(i=0;i<monsters.length;i++){
        spriteX = (monsters[i].frame - 1) * options.grid.spriteFrameSize;
        spriteY = 0;
        if (monsterReady) {
            ctx.drawImage(
                monsterImage,                                   //image
                spriteX, spriteY,                               //image in slice
                options.grid.spriteFrameSize, options.grid.spriteFrameSize,   //size of slice
                monsters[i].x, monsters[i].y,                   //image pos
                options.grid.spriteFrameSize, options.grid.spriteFrameSize    //size of image
            );
        }
        if(options.showHitBoxes == true){
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.rect(monsters[i].x + monsters[i].hitBox.offset, monsters[i].y + monsters[i].hitBox.offset, monsters[i].hitBox.w, monsters[i].hitBox.h);
            ctx.fillStyle = "purple";
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    //end monster render loop

    //ATTACK RENDER
    spriteX = 0;
    spriteY = 0;
    switch(hero.lastDirection){
        case 'd':
            spriteX = options.grid.spriteFrameSize * 0;
        break;
        case 'r':
            spriteX = options.grid.spriteFrameSize * 1;
        break;
        case 'u':
            spriteX = options.grid.spriteFrameSize * 2;
        break;
        case 'l':
            spriteX = options.grid.spriteFrameSize * 3;
        break;
    }

    if(hero.attack == true) {
        ctx.drawImage(
            swordImage,                                     //image
            spriteX, spriteY,                               //image in slice
            options.grid.spriteFrameSize, options.grid.spriteFrameSize,   //size of slice
            sword.spriteX, sword.spriteY,                   //image pos
            options.grid.spriteFrameSize, options.grid.spriteFrameSize    //size of image
        );
        if(options.showHitBoxes == true){
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.rect(sword.x, sword.y, sword.w, sword.h);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    //HERO RENDER
    spriteX = 0;
    spriteY = 0;
    switch(hero.lastDirection){
        case 'd':
            spriteX = options.grid.spriteFrameSize * 0;
        break;
        case 'r':
            spriteX = options.grid.spriteFrameSize * 1;
        break;
        case 'u':
            spriteX = options.grid.spriteFrameSize * 2;
        break;
        case 'l':
            spriteX = options.grid.spriteFrameSize * 3;
        break;
    }
    if (heroReady) {
        if(hero.attack == true) {
            spriteY = 64;
        }
        if(hero.status == 'dead') {
            spriteX = 256;
            spriteY = 0;
        }
        ctx.drawImage(
            heroImage,                                      //image
            spriteX, spriteY,                               //image in slice
            options.grid.spriteFrameSize, options.grid.spriteFrameSize,   //size of slice
            hero.x, hero.y,                                 //image pos
            options.grid.spriteFrameSize, options.grid.spriteFrameSize    //size of image
        );
        if(options.showHitBoxes == true){
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.rect(hero.x + hero.hitBox.offset, hero.y + hero.hitBox.offset, hero.hitBox.w, hero.hitBox.h);
            ctx.fillStyle = "blue";
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    //render heads up map
    var i = 0;
    var loopLength = world.length;
    var tile = null;
    var xStart = options.screen.width - 30;
    var x = xStart;
    var y = 10;
    var lastRow = 0;

    for(i; i < loopLength; i++) {
        tile = world[i];
        if(tile.row !== lastRow){
            y += 5;
            x = xStart;
        }
        ctx.fillStyle = 'red';
        ctx.fillRect(x,y,4,4);
        if( tile.isCurrent === true ){
            ctx.fillStyle = 'yellow';
            ctx.fillRect(x,y,4,4);
        }
        x += 5;
        lastRow = tile.row;
    }

    //Render Score
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.font = "18px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("points: " + state.points, 10, 10);
    
    //render screen state messages
    if(state.gameState == 'death'){
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        ctx.font = "120px Helvetica";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText("You Died!", 60, 200);
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillText("You Died!", 62, 202);
        
        ctx.font = "60px Helvetica";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText("ESC or RETURN to try again.", 80, 350);
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillText("ESC or RETURN to try again.", 82, 352);
    }
    if(state.gameState == 'win'){
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        ctx.font = "120px Helvetica";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText("You Win!", 60, 200);
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillText("You Win!", 62, 202);
        
        ctx.font = "60px Helvetica";
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText("ESC or RETURN to play again.", 80, 350);
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillText("ESC or RETURN to play again.", 82, 352);
    }
};

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
};

////////////
// * requestAnimationFrame for all browsers
////////////

var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

////////////
// * START THE GAME
////////////

init();