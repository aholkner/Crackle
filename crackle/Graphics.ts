module crackle {

    export interface ImageParameters {
        sampleNearest: boolean
    }
    
    export class Image {
        img: HTMLImageElement;
        x1: number = 0
        y1: number = 0
        x2: number = NaN
        y2: number = NaN

        params: ImageParameters;
        private static defaultParams = {
            sampleNearest: false
        };

        constructor(path: string, params?: ImageParameters) {
            if (path != null)
                this.img = ResourceQueue.current.loadImage(this, path)
            if (params == null)
                params = Image.defaultParams
            this.params = params
        }

        onLoaded() {
            this.x2 = this.img.width
            this.y2 = this.img.height
        }

        get isLoaded(): boolean {
            return !isNaN(this.x2)
        }

        get width(): number {
            if (!this.isLoaded)
                throw new ResourceNotLoadedException(this.img.src)

            return this.x2 - this.x1
        }

        get height(): number {
            if (!this.isLoaded)
                throw new ResourceNotLoadedException(this.img.src)

            return this.y2 - this.y1
        }

        getRegion(x1: number, y1: number, x2: number, y2: number): Image {
            var region = new Image(null, this.params)
            region.img = this.img
            region.x1 = this.x1 + x1
            region.y1 = this.y1 + y1
            region.x2 = this.x1 + x2
            region.y2 = this.y1 + y2
            return region
        }
    }

    export function translate(x: number, y: number) {
        renderer.translate(x, y)
    }

    export function scale(x: number, y: number) {
        renderer.scale(x, y)
    }

    export function rotate(radians: number) {
        renderer.rotate(radians)
    }

    export function pushTransform() {
        renderer.pushTransform()
    }

    export function popTransform() {
        renderer.popTransform()
    }

    export function setColor(r: number, g: number, b: number, a: number) {
        renderer.setColor(r, g, b, a)
    }

    export function clear(r: number, g: number, b: number, a: number) {
        renderer.clear(r, g, b, a)
    }

    export function fillRect(x1: number, y1: number, x2: number, y2: number) {
        renderer.fillRect(x1, y1, x2, y2)
    }

    export function drawImage(img: Image, x1: number, y1: number, x2?: number, y2?: number) {
        var width, height
        if (x2 == null)
            width = img.width
        else
            width = x2 - x1
        if (y2 == null)
            height = img.height
        else
            height = y2 - y1
        renderer.drawImageRegion(img, x1, y1, width, height, img.x1, img.y1, img.x2 - img.x1, img.y2 - img.y1)
    }

    export function drawImageRegion(img: Image, x1: number, y1: number, x2: number, y2: number, ix1: number, iy1: number, ix2: number, iy2: number) {
        renderer.drawImageRegion(img, x1, y1, x2 - x1, y2 - y1, img.x1 + ix1, img.y1 + iy1, ix2 - ix1, iy2 - iy1)
    }

    export function drawString(font: Font, text: string, x: number, y: number, params?: TextLayoutParameters) {
        if (font == null)
            font = renderer.defaultFont

        if (params == null)
            renderer.drawString(font, text, x, y)
        else {
            var run = new TextRun({ font: font }, text)
            var textLayout = new TextLayout([run], x, y, params)
            drawTextLayout(textLayout)
        }
    }

    export function drawTextLayout(textLayout: TextLayout) {
        var lines = textLayout.lines
        for (var i = 0; i < lines.length; ++i) {
            var line = lines[i]
            var x = line.x
            var y = line.y
            for (var runIndex = 0; runIndex < line.runs.length; ++runIndex) {
                // TODO color

                var run = line.runs[runIndex]
                renderer.drawString(run.style.font, run.text, x, y)
                x += run.advance
            }
        }
    }
} 