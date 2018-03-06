define([
    'asset-manager',
    'game-engine',
    'game-board',
    'entity',
], function(
    AssetManager,
    GameEngine,
    GameBoard,
    Entity,
) {

    let init = function() {
        console.log("init")
    };

    toload = [
        "img/ZXe.png",
        "img/puppy.png",
        "img/bg.png"
    ];

    let ASSET_MANAGER = new AssetManager(toload);

    ASSET_MANAGER.downloadAll(function () {
        console.log("starting up da sheild");
        let canvas = document.getElementById('gameWorld');
        let ctx = canvas.getContext('2d');
        let bg = ASSET_MANAGER.getAsset("img/bg.png");
        let gameEngine = new GameEngine(bg);

        gameEngine.addEntity(new Entity.Hero(
            gameEngine, 
            200, 500, 
            ASSET_MANAGER.getAsset("img/ZXe.png"), 
            ctx));

        gameEngine.addEntity(new Entity.Puppy(
            gameEngine, 
            200, 200, 
            ASSET_MANAGER.getAsset("img/puppy.png"), 
            ctx))
     
        gameEngine.init(ctx);
        gameEngine.start();
    });

    return {
        init: init
    };

});

