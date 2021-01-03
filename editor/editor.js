/**
    The Trial of Tim
    Level Editor
    Replaces RULES.js for quest engine
    Click Processor
    @author Ben Borkowski
    @publisher Opal Games
    1. draw the screen
    2. show hover state on tles
    3. change clicked type based on dropdown
    4. save out config as JSON
    5. world setup?
**/

console.log('run the editor');
//listen
document.getElementById("btnLoadScreen").addEventListener('click', function() {
    rules.loadScreen();
});


var gameRules = function () {

    var reset = function () {
        state = new gameState();
        og.cl(box);
        og.cl(state);
    }

    var loadScreen = function () {
        var screenData = document.getElementById("screenOutput").value;
        var screenDataJson = JSON.parse(screenData);
        console.log(screenDataJson);
        console.log(box.board);
        var i = 0;
        var loopLength = screenDataJson.tiles.length;
        var tile = null;
        for(i; i < loopLength; i++) {
            box.board[i].tileType = screenDataJson.tiles[i].tileType;
            switch(box.board[i].tileType){
                case 'tile':
                    box.board[i].ui.image.src = '../images/tile-01.png';
                break;
                case 'bush':
                    box.board[i].ui.image.src = '../images/tile-bush.png';
                break;
                case 'rock':
                    box.board[i].ui.image.src = '../images/tile-rock.png';
                break;
                case 'door':
                    box.board[i].ui.image.src = '../images/tile-door.png';
                break;
            }
        }
    }

    var processClick = function (click) {
        var tileNum = og.board.getTileNumFromClick( click );
        var tileId = og.board.convertTileNumToId( tileNum );
        var tile = box.board[tileId]
        console.log(tile);
        //on click go to the next tile type to cycle through
        switch(tile.tileType){
            case 'tile':
                tile.tileType = 'bush';
                tile.ui.image.src = '../images/tile-bush.png';
            break;
            case 'bush':
                tile.tileType = 'rock';
                tile.ui.image.src = '../images/tile-rock.png';
            break;
            case 'rock':
                tile.tileType = 'door';
                tile.ui.image.src = '../images/tile-door.png';
            break;
            case 'door':
                tile.tileType = 'tile';
                tile.ui.image.src = '../images/tile-01.png';
            break;
        }
        var screen = exportScreen();
        var data = JSON.stringify(screen);
        document.getElementById("screenOutput").value = data;
    }

    var exportScreen = function () {
        var world = {};
        var screen = {};
        var i = 0;
        var loopLength = box.board.length;
        var tile = null;
        var tempTile = {};
        world.screens = [];
        screen.tiles = [];
        for(i; i < loopLength; i++) {
            tile = box.board[i];
            tempTile = {};
            tempTile.num = tile.num;
            tempTile.col = tile.col;
            tempTile.row = tile.row;
            tempTile.tileType = tile.tileType;
            screen.tiles.push(tempTile);
        }
        world.screens.push(screen);
        return world;
    }

    return {
        reset : reset,
        processClick : processClick,
        loadScreen : loadScreen
    }
}