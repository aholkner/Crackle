/// <reference path="Renderer.ts" />
/// <reference path="CanvasRenderer.ts" />
/// <reference path="Game.ts" />

module bacon {

    export function init() {
        if (renderer == null)
            renderer = new CanvasRenderer()
    }

}

class Game extends bacon.Game {
    public onTick() {
        bacon.clear(255, 0, 0, 255)
    }
}

window.onload = () => {
    var el = document.getElementById('content');
    var game = new Game(el);
    game.run();
};