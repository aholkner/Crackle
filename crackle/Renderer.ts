module crackle {

    export interface Renderer {
        beginFrame(canvas: HTMLCanvasElement)
        endFrame()

        setColor(r: number, g: number, b: number, a: number)
        clear(r: number, g: number, b: number, a: number)
        drawImageRegion(img: Image, x: number, y: number, width: number, height: number, sx: number, sy: number, swidth: number, sheight: number)
        drawString(font: Font, text: string, x: number, y: number)
        measureString(font: Font, text: string)
    }

    export var renderer: Renderer;

}