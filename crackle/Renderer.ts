module crackle {

    export interface Renderer {
        beginFrame(canvas: HTMLCanvasElement)
        endFrame()

        setColor(r: number, g: number, b: number, a: number)
        clear(r: number, g: number, b: number, a: number)
        drawImage(img: Image, x1: number, y1: number, x2: number, y2: number)
        drawString(font: Font, text: string, x: number, y: number)
        measureString(font: Font, text: string)
    }

    export var renderer: Renderer;

}