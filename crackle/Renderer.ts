module bacon {

    export interface Renderer {
        beginFrame(canvas: HTMLCanvasElement)
        endFrame()

        setColor(r: number, g: number, b: number, a: number)
        clear(r: number, g: number, b: number, a: number)
        drawImage(img: HTMLImageElement, x1: number, y1: number, x2: number, y2: number)
    }

    export var renderer: Renderer;

}