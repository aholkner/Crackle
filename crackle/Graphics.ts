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

    export class Font {
        specifier: string

        constructor(specifier: string) {
            this.specifier = specifier
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

    export function drawString(font: Font, text: string, x: number, y: number) {
        renderer.drawString(font, text, x, y)
    }
} 