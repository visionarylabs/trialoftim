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
options.grid.width = 15;
options.grid.height = 10;

var state = {};
var ticks = 0;
var lastTick = 0;
var world = null;

var attackReady = true;
var points = 0;

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
    lastDirection : null
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
        isCurrent : false
    };
    return screen;
};

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

var resetMonster = function () {
    //set the monster
    monsters = [];
    var monster = makeMonster();
    monsters.push(monster);
};

var makeMonster = function(){
    var monster = {
        x: 0,
        y: 0,
        velX : 0,
        velY : 0,
        speed : 150,
        status : 'alive', //alive, dead
        frame : 1 //the frame of the animation, 1 or 2, 3 for death
    };
    monster.x = ranomdNumberRange(1,15) * options.grid.tileSize - options.grid.tileSize;
    monster.y = ranomdNumberRange(1,10) * options.grid.tileSize - options.grid.tileSize;
    return monster;
}

var resetHero = function () {
    hero.x = ranomdNumberRange(1,15) * options.grid.tileSize - options.grid.tileSize;
    hero.y = ranomdNumberRange(1,10) * options.grid.tileSize - options.grid.tileSize;
}

//see if there is a screen on the world map to move to
//return the screen id
var checkScreen = function( direction ){
    console.log('check screen ' + direction);
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
                    console.log('found adjacent down screen ' + screenNum);
                    return screenNum;
                }
            break;
            case 'right':
                if( 
                    currentScreen.row == world[i].row &&
                    currentScreen.col == world[i].col - 1
                ){
                    console.log('found adjacent right screen ' + screenNum);
                    return screenNum;
                }
            break;
            case 'up':
                if( 
                    currentScreen.col == world[i].col &&
                    currentScreen.row == world[i].row + 1
                ){
                    console.log('found adjacent up screen ' + screenNum);
                    return screenNum;
                }
            break;
            case 'left':
                if( 
                    currentScreen.row == world[i].row &&
                    currentScreen.col == world[i].col + 1
                ){
                    console.log('found adjacent left screen ' + screenNum);
                    return screenNum;
                }
            break;
        }
    }
}
var moveScreen = function( moveToScreenId, direction ){
    moveToScreenId = moveToScreenId -1; //todo fix num vs id for 0 check
    console.log('move to screen ' + moveToScreenId + ' ' + direction);
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

////////////
// * Initialize the Game
////////////

var init = function(){
    world = new worldFactory(3,3);
    world[7].isCurrent = true;
    console.log(world);
    resetHero();
    resetMonster();
    main();
};

////////////
// * UPDATE
////////////

var update = function (modifier) {

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
    if (32 in keysDown) { // Player holding space
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
        sword.spriteY = hero.y - options.grid.tileSize;
    }
    if(hero.lastDirection == 'd'){
        sword.h = swordLong;
        sword.w = swordShort;
        sword.x = hero.x + halfTile - eigthTile;
        sword.y = hero.y + options.grid.tileSize;
        sword.spriteX = hero.x;
        sword.spriteY = hero.y + options.grid.tileSize;
    }
    if(hero.lastDirection == 'l'){
        sword.w = swordLong;
        sword.h = swordShort;
        sword.x = hero.x - swordLong;
        sword.y = hero.y + halfTile - eigthTile;
        sword.spriteX = hero.x - options.grid.tileSize;
        sword.spriteY = hero.y;
    }
    if(hero.lastDirection == 'r'){
        sword.w = swordLong;
        sword.h = swordShort;
        sword.x = hero.x + options.grid.tileSize;
        sword.y = hero.y + halfTile - eigthTile;
        sword.spriteX = hero.x + options.grid.tileSize;
        sword.spriteY = hero.y;
    }

    /**
        HERO ON EDGE
        MOVE TO SCREEN IF POSSILBE
    **/
    // X Edge
    var moveToScreenId = null;
    if (hero.x >= canvas.width - options.grid.tileSize) {  //right edge
        if( moveToScreenId = checkScreen('right') ){
            moveScreen(moveToScreenId,'right');
        }else{
            hero.x = canvas.width - options.grid.tileSize;
        }
    }else if (hero.x <= 0) { //left edge
        if( moveToScreenId = checkScreen('left') ){
            moveScreen(moveToScreenId,'left');
        }else{
            hero.x = 0;
        }
    }
    // Y Edge
    if (hero.y >= canvas.height - options.grid.tileSize) { //bottom edge
        if( moveToScreenId = checkScreen('down') ){
            moveScreen(moveToScreenId,'down');
        }else{
            hero.y = canvas.height - options.grid.tileSize;
        }
    }else if (hero.y <= 0) { //top edge
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

        // ATTACK HITS // Monster Dies
        if (
            hero.attack == true
            && sword.x <= (monster.x + options.grid.tileSize)
            && monster.x <= (sword.x + options.grid.tileSize)
            && sword.y <= (monster.y + options.grid.tileSize)
            && monster.y <= (sword.y + options.grid.tileSize)
            && monster.status == 'alive'
        ) {
            ++points;
            monster.frame = 3; //3 = death frame
            monster.status = 'dead';
        }

        // turn monster on edge
        if (monster.x >= canvas.width - monsterImage.width) {
            monster.x = canvas.width - monsterImage.width;
            monster.velX = -1;
        }
        else if (monster.x <= 0) {
            monster.x = 0;
            monster.velX = 1;
        }
        if (monster.y >= canvas.height - monsterImage.height) {
            monster.y = canvas.height - monsterImage.height;
            monster.velY = -1;
        }
        else if (monster.y <= 0) {
            monster.y = 0;
            monster.velY = 1;
        }

        // hero touching monster? Hero Dies!
        if (
            hero.x <= (monster.x + options.grid.tileSize)
            && monster.x <= (hero.x + options.grid.tileSize)
            && hero.y <= (monster.y + options.grid.tileSize)
            && monster.y <= (hero.y + options.grid.tileSize)
            && monster.status == 'alive'
        ) {
            points = 0;
            resetHero();
            resetMonster();
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
        //clean up destoryed monsters
        var addMonsters = false;
        for(monsterCheckNum = monsters.length - 1; monsterCheckNum >= 0; monsterCheckNum--){
            if(monsters[monsterCheckNum].status == 'dead'){
                monsters.splice(monsterCheckNum,1);
                addMonsters = true;
            }
        }
        //add more monsters
        if(addMonsters == true){
            var monster = makeMonster();
            monsters.push(monster);
            var monster = makeMonster();
            monsters.push(monster);
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
        //testing monster shape
        /*
            ctx.beginPath();
            ctx.rect(monster.x, monster.y, 64, 64);
            ctx.fillStyle = "purple";
            ctx.fill();
        */
        spriteX = (monsters[i].frame - 1) * options.grid.tileSize;
        spriteY = 0;
        if (monsterReady) {
            ctx.drawImage(
                monsterImage,                                   //image
                spriteX, spriteY,                               //image in slice
                options.grid.tileSize, options.grid.tileSize,   //size of slice
                monsters[i].x, monsters[i].y,                   //image pos
                options.grid.tileSize, options.grid.tileSize    //size of image
            );
        }
    }
    //end monster render loop

    //ATTACK RENDER
    spriteX = 0;
    spriteY = 0;
    switch(hero.lastDirection){
        case 'd':
            spriteX = options.grid.tileSize * 0;
        break;
        case 'r':
            spriteX = options.grid.tileSize * 1;
        break;
        case 'u':
            spriteX = options.grid.tileSize * 2;
        break;
        case 'l':
            spriteX = options.grid.tileSize * 3;
        break;
    }

    if(attackReady && hero.attack == true) {
        //testing sword shape
        /*
            ctx.beginPath();
            ctx.rect(sword.x, sword.y, sword.w, sword.h);
            ctx.fillStyle = "red";
            ctx.fill();
        */
        ctx.drawImage(
            swordImage,                                     //image
            spriteX, spriteY,                               //image in slice
            options.grid.tileSize, options.grid.tileSize,   //size of slice
            sword.spriteX, sword.spriteY,                   //image pos
            options.grid.tileSize, options.grid.tileSize    //size of image
        );
    }

    //HERO RENDER
    spriteX = 0;
    spriteY = 0;
    switch(hero.lastDirection){
        case 'd':
            spriteX = options.grid.tileSize * 0;
        break;
        case 'r':
            spriteX = options.grid.tileSize * 1;
        break;
        case 'u':
            spriteX = options.grid.tileSize * 2;
        break;
        case 'l':
            spriteX = options.grid.tileSize * 3;
        break;
    }
    if (heroReady) {
        //Testing square for character
        /*
            ctx.beginPath();
            ctx.rect(hero.x, hero.y, 64, 64);
            ctx.fillStyle = "blue";
            ctx.fill();
        */
        if(attackReady && hero.attack == true) {
            spriteY = 64;
        }
        ctx.drawImage(
            heroImage,                                      //image
            spriteX, spriteY,                               //image in slice
            options.grid.tileSize, options.grid.tileSize,   //size of slice
            hero.x, hero.y,                                 //image pos
            options.grid.tileSize, options.grid.tileSize    //size of image
        );
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
    ctx.fillText("points: " + points, 10, 10);
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