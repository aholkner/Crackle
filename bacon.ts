/// <reference path="Renderer.ts" />
/// <reference path="CanvasRenderer.ts" />
/// <reference path="Game.ts" />
/// <reference path="Graphics.ts" />

module bacon {

    export function init() {
        if (renderer == null)
            renderer = new CanvasRenderer()
    }

}

var img = new bacon.Image('res/kitten.png')

class Game extends bacon.Game {
    public onTick() {
        bacon.clear(255, 0, 0, 255)
        bacon.drawImage(img, 0, 0, 100, 100)
    }
}

window.onload = () => {
    var el = document.getElementById('content');
    var game = new Game(el);
    game.run();
};