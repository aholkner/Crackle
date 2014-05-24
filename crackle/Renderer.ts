module crackle {

    export interface Renderer {
        defaultFont: Font

        beginFrame(canvas: HTMLCanvasElement)
        endFrame()

        translate(x: number, y: number)
        scale(x: number, y: number)
        rotate(radians: number)
        pushTransform()
        popTransform()

        setColor(r: number, g: number, b: number, a: number)
        clear(r: number, g: number, b: number, a: number)
        fillRect(x1: number, y1: number, x2: number, y2: number)
        drawImageRegion(img: Image, x: number, y: number, width: number, height: number, sx: number, sy: number, swidth: number, sheight: number)
        drawString(font: Font, text: string, x: number, y: number)
        measureString(font: Font, text: string)
    }

    export var renderer: Renderer;

}