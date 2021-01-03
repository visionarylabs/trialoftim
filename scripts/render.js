
////////////
// * RENDER
////////////

var render = function () {

    //BOARD RENDER REPEAT TILE FOR BACKGROUND
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
        var ptrn = ctx.createPattern(bgImage, 'repeat');
        ctx.fillStyle = ptrn;
        ctx.fillRect(0, 0, canvas.width, canvas.height); // context.fillRect(x, y, width, height);
    }
    
    // RENDER SCREEN TILES // started from renderBoard in og-tools render.js
    var renderScreen = function () {
        var screenId = getCurrentScreenId();
        var tiles = world[screenId].tiles;
        var i = 0;
        var loopLength = tiles.length;
        var tile = null;
        for(i; i < loopLength; i++) {
            tile = tiles[i];
            ctx.fillStyle = tile.ui.color;
            ctx.fillRect(tile.ui.x,tile.ui.y,options.grid.tileSize,options.grid.tileSize);
            if(tile.ui.image.src){
                ctx.drawImage(tile.ui.image, tile.ui.x - tile.ui.imageOffset, tile.ui.y - tile.ui.imageOffset);
            }
        }
    }(); //TODO for now just call this inside render

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
    switch(hero.curDirection){
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
    switch(hero.curDirection){
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
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "18px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("points: " + state.points, 10, 10);
    ctx.fillText("cur: " + hero.curDirection, 10, 30);
    ctx.fillText("X: " + hero.x, 10, 50);
    ctx.fillText("Y: " + hero.y, 10, 70);
    ctx.fillText("moveTargetX: " + hero.moveTargetX, 10, 90);
    ctx.fillText("moveTargetY: " + hero.moveTargetY, 10, 110);
    
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
}