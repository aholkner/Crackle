module crackle {

    export interface ImageParameters {
        sampleNearest: boolean
    }
    
    export class Image {
        img: HTMLImageElement;
        params: ImageParameters;
        private static defaultParams = {
            sampleNearest: false
        };

        constructor(path: string, params?: ImageParameters) {
            this.img = ResourceQueue.current.loadImage(path)
            if (params == null)
                params = Image.defaultParams
            this.params = params
        }

        get width(): number {
            if (this.img.width == 0)
                throw new ResourceNotLoadedException(this.img.src)
            return this.img.width
        }

        get height(): number {
            if (this.img.height == 0)
                throw new ResourceNotLoadedException(this.img.src)
            return this.img.height
        }
    }

    export function setColor(r: number, g: number, b: number, a: number) {
        renderer.setColor(r, g, b, a)
    }

    export function clear(r: number, g: number, b: number, a: number) {
        renderer.clear(r, g, b, a)
    }

    export function drawImage(img: Image, x1: number, y1: number, x2?: number, y2?: number) {
        if (x2 == null)
            x2 = x1 + img.width
        if (y2 == null)
            y2 = y1 + img.height
        renderer.drawImage(img, x1, y1, x2, y2)
    }

    export function drawImageRegion(img: Image, x1: number, y1: number, x2: number, y2: number, ix1: number, iy1: number, ix2: number, iy2: number) {
        renderer.drawImageRegion(img, x1, y1, x2, y2, ix1, iy1, ix2, iy2)
    }

    export function drawString(font: Font, text: string, x: number, y: number, params?: TextLayoutParameters) {
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