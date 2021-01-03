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
    var tileTest = null;
    var heroPosSnap = {
        x : null,
        y : null,
        xCeil : null,
        xFloor : null,
        yCeil : null,
        yFloor : null,
    };

    /**
        SNAPPING
        HERO SNAP TO GRID
    **/
    heroPosSnap.xCeil = Math.ceil(hero.x / options.grid.gridSnapSize) * options.grid.gridSnapSize;
    heroPosSnap.xFloor = Math.floor(hero.x / options.grid.gridSnapSize) * options.grid.gridSnapSize;
    if( Math.abs(hero.x - heroPosSnap.xCeil) < Math.abs(hero.x - heroPosSnap.xFloor)){
        heroPosSnap.x = heroPosSnap.xCeil;
    }else{
        heroPosSnap.x = heroPosSnap.xFloor;
    }

    heroPosSnap.yCeil = Math.ceil(hero.y / options.grid.gridSnapSize) * options.grid.gridSnapSize;
    heroPosSnap.yFloor = Math.floor(hero.y / options.grid.gridSnapSize) * options.grid.gridSnapSize;
    if( Math.abs(hero.y - heroPosSnap.yCeil) < Math.abs(hero.y - heroPosSnap.yFloor)){
        heroPosSnap.y = heroPosSnap.yCeil;
    }else{
        heroPosSnap.y = heroPosSnap.yFloor;
    }

    if (38 in keysDown || 87 in keysDown) { // Player holding up or w
        if(hero.attacking == false){
            if(hero.curDirection != 'u'){
                hero.x = heroPosSnap.x;
            }
            hero.y -= hero.speed * modifier;
            hero.curDirection = 'u';
        }
    }
    if (40 in keysDown || 83 in keysDown) { // Player holding down or s
        if(hero.attacking == false){
            if(hero.curDirection != 'd'){
                hero.x = heroPosSnap.x;
            }
            hero.y += hero.speed * modifier;
            hero.curDirection = 'd';
        }
    }



    if (37 in keysDown || 65 in keysDown) { // Player holding left or a
        if(hero.attacking == false){
            if(hero.curDirection != 'l'){
                hero.y = heroPosSnap.y;
            }
            hero.x -= hero.speed * modifier;
            hero.curDirection = 'l';
        }
    }
    if (39 in keysDown || 68 in keysDown) { // Player holding right or d
        if(hero.attacking == false){
            if(hero.curDirection != 'r'){
                hero.y = heroPosSnap.y;
            }
            hero.x += hero.speed * modifier;
            hero.curDirection = 'r';
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

    if(hero.curDirection == 'u'){
        sword.h = swordLong;
        sword.w = swordShort;
        sword.x = hero.x + halfTile - eigthTile;
        sword.y = hero.y - swordLong;
        sword.spriteX = hero.x;
        sword.spriteY = hero.y - options.grid.spriteFrameSize;
    }
    if(hero.curDirection == 'd'){
        sword.h = swordLong;
        sword.w = swordShort;
        sword.x = hero.x + halfTile - eigthTile;
        sword.y = hero.y + options.grid.spriteFrameSize;
        sword.spriteX = hero.x;
        sword.spriteY = hero.y + options.grid.spriteFrameSize;
    }
    if(hero.curDirection == 'l'){
        sword.w = swordLong;
        sword.h = swordShort;
        sword.x = hero.x - swordLong;
        sword.y = hero.y + halfTile - eigthTile;
        sword.spriteX = hero.x - options.grid.spriteFrameSize;
        sword.spriteY = hero.y;
    }
    if(hero.curDirection == 'r'){
        sword.w = swordLong;
        sword.h = swordShort;
        sword.x = hero.x + options.grid.spriteFrameSize;
        sword.y = hero.y + halfTile - eigthTile;
        sword.spriteX = hero.x + options.grid.spriteFrameSize;
        sword.spriteY = hero.y;
    }

    /**
        TILE HIT TEST
        HERO HITS A TILE
    **/
    var j = 0; //tiles
    var tile = null;
    for( j = 0; j < world[currentScreenId].tiles.length; j++ ) {
        tile = world[currentScreenId].tiles[j];
        if ( tile.tileType == 'rock' || tile.tileType == 'bush' ){
            if (
                hero.x < (tile.ui.x + options.grid.tileSize) && (hero.x + options.grid.tileSize) > tile.ui.x &&
                hero.y < (tile.ui.y + options.grid.tileSize) && (hero.y + options.grid.tileSize) > tile.ui.y
            ) {
                //push back to edge of block
                if(hero.curDirection == 'u'){
                    hero.y = tile.ui.y + options.grid.tileSize;
                }
                if(hero.curDirection == 'd'){
                    hero.y = tile.ui.y - options.grid.tileSize;
                }
                if(hero.curDirection == 'r'){
                    hero.x = tile.ui.x - options.grid.tileSize;
                }
                if(hero.curDirection == 'l'){
                    hero.x = tile.ui.x + options.grid.tileSize;
                }
            }
        }
    }

    /**
        EDGE TEST
        HERO ON EDGE
        MOVE TO SCREEN IF POSSILBE
    **/
    // X Edge
    var moveToScreenId = null;
    if (hero.x > canvas.width - options.grid.spriteFrameSize) { //right edge
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
            monster.lastGoodX = monster.x;
            monster.lastGoodY = monster.y;
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

        // MONSTER TILE TEST
        var j = 0; //tiles
        var tile = null;
        for( j = 0; j < world[currentScreenId].tiles.length; j++ ) {
            tile = world[currentScreenId].tiles[j];
            if (
                (tile.tileType == 'rock' || tile.tileType == 'bush') && 
                monster.x < (tile.ui.x + options.grid.tileSize) && (monster.x + options.grid.tileSize) > tile.ui.x &&
                monster.y < (tile.ui.y + options.grid.tileSize) && (monster.y + options.grid.tileSize) > tile.ui.y
            ) {
                monster.x = monster.lastGoodX;
                monster.y = monster.lastGoodY;
                monster.velX = monster.velX * -1;
                monster.velY = monster.velY * -1;
            }
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

}