/// <reference path="Renderer.ts" />
/// <reference path="CanvasRenderer.ts" />
/// <reference path="Game.ts" />
/// <reference path="Graphics.ts" />

module bacon {

    export function init() {
        if (renderer == null)
            renderer = new CanvasRenderer()
    }

    export var timestep: number = 0.016 // TODO

}
