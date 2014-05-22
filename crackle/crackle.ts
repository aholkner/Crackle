module crackle {

    export function init() {
        if (renderer == null)
            renderer = new CanvasRenderer()
    }

    export var timestep: number = 0.016 // TODO

}
