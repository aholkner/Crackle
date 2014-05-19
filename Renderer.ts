module bacon {

    export interface Renderer {
        beginFrame(canvas: HTMLCanvasElement)
        endFrame()

        setColor(r: number, g: number, b: number, a: number);
        clear(r: number, g: number, b: number, a: number);
    }

    export var renderer: Renderer;

}