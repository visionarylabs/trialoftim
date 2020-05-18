/**
    Levolon State and Rules
    * also requires
    * quest/tool
    * quest/render
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

// Sword
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

//attack
var attackReady = true;
var points = 0;

// Game objects
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
var monster = {
    x: 0,
    y: 0,
    velX : 0,
    velY : 0,
    speed : 150,
    status : 'alive', //alive, dead
    frame : 1 //the frame of the animation, 1 or 2, 3 for death
};
var sword = {
    x:0,
    y:0,
    w: 10,
    h: 10
}

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

// Reset the monster when the player catches a monster
var resetMonster = function () {
    //set the monster
    monster.status = 'alive';
    monster.frame = 1;
    monster.x = ranomdNumberRange(1,15) * options.grid.tileSize - options.grid.tileSize;
    monster.y = ranomdNumberRange(1,10) * options.grid.tileSize - options.grid.tileSize;
    console.log(monster.x);
    console.log(monster.y);
};

var resetHero = function () {
    hero.x = ranomdNumberRange(1,15) * options.grid.tileSize - options.grid.tileSize;
    hero.y = ranomdNumberRange(1,10) * options.grid.tileSize - options.grid.tileSize;
    console.log(hero.x);
    console.log(hero.y);
}

var init = function(){
    resetHero();
    resetMonster();
    main();
};

var ranomdNumberRange = function(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Update game objects
var update = function (modifier) {
    
    //set ticks
    if( (then - lastTick) > (250) ){
        lastTick = then;
        ticks++;
        
        //animate monster frame
        if(monster.frame == 1){
            monster.frame = 2;
        }else if(monster.frame == 2){
            monster.frame = 1;
        }
        
        if(monster.status == 'dead'){
            resetMonster();
        }
        
    }
    
    if (38 in keysDown) { // Player holding up
        hero.y -= hero.speed * modifier;
        hero.lastDirection = 'u';
    }
    if (40 in keysDown) { // Player holding down
        hero.y += hero.speed * modifier;
        hero.lastDirection = 'd';
    }
    if (37 in keysDown) { // Player holding left
        hero.x -= hero.speed * modifier;
        hero.lastDirection = 'l';
    }
    if (39 in keysDown) { // Player holding right
        hero.x += hero.speed * modifier;
        hero.lastDirection = 'r';
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

    // stop hero on edge
    if (hero.x >= canvas.width - heroImage.width) {
        hero.x = canvas.width - heroImage.width;
    }
    else if (hero.x <= 0) {
        hero.x = 0;
    }
    if (hero.y >= canvas.height - heroImage.height) {
        hero.y = canvas.height - heroImage.height;
    }
    else if (hero.y <= 0) {
        hero.y = 0;
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

};

// * STATE // FACTORIES
var gameFactory = function () {
    const actorFactory = function (spriteType,slug,name,tile) {
        var actor = {
            slug : slug,
            name : name,
            spriteType : spriteType,
            stats : {},
            items : [],
            ui : {},
        };
        actor.ui = setUi(0,0,48,12,'black',1,42,7);
        actor.stats = {
            strength : 10,
            toughness : 2,
            intelligence : 1,
            will : 1,
            diplomacy : 1,
            health : 20,
        }
        switch(spriteType){
            case 'hero':
                actor.ui.size = {w:48,h:12};
                actor.ui.color = 'blue';
                actor.ui.image.src = './images/wq-01.png';
            break;
            case 'monster':
                actor.ui.size = {w:48,h:12};
                actor.ui.color = 'red';
                actor.ui.image.src = './images/wq-02.png';
                switch(slug){
                    case 'rat':
                    actor.ui.image.src = './images/wq-m-01.png';
                    actor.stats.strength = 10;
                    actor.stats.thoughness = 2;
                    actor.stats.health = 10;
                    break;
                    case 'fiend':
                    actor.ui.image.src = './images/wq-m-02.png';
                    actor.stats.strength = 30;
                    actor.stats.thoughness = 5;
                    actor.stats.health = 40;
                    break;
                    case 'blob':
                    actor.ui.image.src = './images/wq-m-03.png';
                    actor.stats.strength = 20;
                    actor.stats.thoughness = 8;
                    actor.stats.health = 30;
                    break;
                }
            break;
        }
        return actor;
    }
}

////////////
// * RENDER
////////////

// Draw everything
var render = function () {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
        var ptrn = ctx.createPattern(bgImage, 'repeat');
        ctx.fillStyle = ptrn;
        ctx.fillRect(0, 0, canvas.width, canvas.height); // context.fillRect(x, y, width, height);
    }
    
    //sprite x frame based on d,r,u,l
    var spriteX = 0;
    var spriteY = 0;
    
    //MONSTER
    //Testing square for monster
    /*
        ctx.beginPath();
        ctx.rect(monster.x, monster.y, 64, 64);
        ctx.fillStyle = "purple";
        ctx.fill();
    */
    spriteX = (monster.frame - 1) * options.grid.tileSize;
    spriteY = 0;
    if (monsterReady) {
        ctx.drawImage(
            monsterImage,                                   //image
            spriteX, spriteY,                               //image in slice
            options.grid.tileSize, options.grid.tileSize,   //size of slice
            monster.x, monster.y,                           //image pos
            options.grid.tileSize, options.grid.tileSize    //size of image
        );
    }
    
    //ATTACK
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
        //baackup red sword fill
        /*
        ctx.beginPath();
        ctx.rect(sword.x, sword.y, sword.w, sword.h);
        ctx.fillStyle = "red";
        ctx.fill();
        */
        ctx.drawImage(
            swordImage,                                     //image
            spriteX, spriteY,                                     //image in slice
            options.grid.tileSize, options.grid.tileSize,   //size of slice
            sword.spriteX, sword.spriteY,                               //image pos
            options.grid.tileSize, options.grid.tileSize    //size of image
        );
    }

    //HERO
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
        // draw the hero
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

    // Score
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

// requestAnimationFrame for all browsers
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

////////////
// * START THE GAME
////////////

init();