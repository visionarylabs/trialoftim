/**
    STATE FOR TRIAL OF TIM EDITOR
    Editor Board State and Options
**/
// game setup options
var options = {
    tileSize : 64,
    columns : 15,
    rows : 10,
    gameSpeed : 500,
    gameDelay : 400,
    renderTimer : false,
    renderStatic : false,
    tileActionColor : "rgba(255, 255, 255, 0)", //"rgba(255, 255, 255, 0.4)"
    tileHoverColor : "rgba(252, 251, 177, 0.25)" //"rgba(252, 251, 177, 0.5)"
};

var gameState = function () {
    
    //build the main sprites from the game box
    var getStartingSprites = function(spriteType) {
        var node = null;
        var sprite = null;
        var startingSprites = [];
        if (box.sprites.hasOwnProperty(spriteType)) {
            for (var key in box.sprites[spriteType]) {
                if (box.sprites[spriteType].hasOwnProperty(key)) {
                    node = box.sprites[spriteType][key];
                    sprite = {
                        slug : node.slug,
                        tile : 1,
                    };
                    if(node.stats){
                        if(node.stats.health) sprite.health = node.stats.health;
                    }
                    startingSprites.push(sprite);
                }
            }
        }
        return startingSprites;
    }
    
    // game objects
    var board = {
        
    };
    
    var sprites = {
    }
    
    var state = {
        player : 1,
        currentSelection : null,
        inputFreeze : false,
        history : [],
        screen : null,
    };
    
    // return main game objects
    return {
        board : board,
        sprites : sprites,
        state : state,
    }
}

/**
    MAIN GAME FACTORY
    make all the game pieces
    game piece templates
**/
var gameFactory = function () {

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
        tile.ui = setUi(x,y,options.tileSize,options.tileSize,color,0,0,0);
        if(tile.tileType === 'tile'){
            tile.ui.image.src = '../images/tile-01.png';
        }
        if(tile.tileType === 'bush'){
            tile.ui.image.src = '../images/tile-bush.png';
        }
        return tile;
    };
    
    /**
        board factory for TOT level editor
    **/
    const boardFactory = function(cols,rows,) {
        var board = [];
        var tile = null;
        var iCol = 0;
        var iRow = 0;
        var num = 0;
        var color = null;
        var tileType = null;
        
        for( iRow; iRow < rows; iRow++ ) {
            for( iCol; iCol < cols; iCol++ ) {
                num++;
                if( options.columns % 2 == 0 ) {
                    if( iRow % 2 == 0 ) {
                        if( num % 2 == 0 ) color = '#aaa'; else color = '#bbb';
                    }else{
                        if( num % 2 == 0 ) color = '#bbb'; else color = '#aaa';
                    }
                }else{
                    if( num % 2 == 0 ) color = '#aaa'; else color = '#bbb';
                }
                
                tileType = 'tile';
                
                tile = tileFactory( num, iCol, iRow, tileType, iCol * options.tileSize, iRow * options.tileSize, color );
                tile.action = true; //all true for editor
                board.push(tile);
            }
            iCol = 0;
        }
        
        return board;
    }
    
    /**
        box is the full data modal of all rules / monster tables decks etc
    **/
    var getBox = function () {

        var board = new boardFactory(options.columns,options.rows);

        //return the game box
        return {
            board : board
        }
        
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
    
    return {
        getBox : getBox,
        setUi : setUi,
    }
}
//end gameFactory OBJ
