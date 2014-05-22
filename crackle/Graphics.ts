module crackle {

    export function setColor(r: number, g: number, b: number, a: number) {
        renderer.setColor(r, g, b, a)
    }

    export function clear(r: number, g: number, b: number, a: number) {
        renderer.clear(r, g, b, a)
    }

    export class Image {
        img: HTMLImageElement;

        constructor(path: string) {
            this.img = Resources.loadImage(path)
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

    export function drawImage(img: Image, x1: number, y1: number, x2: number, y2: number) {
        renderer.drawImage(img.img, x1, y1, x2, y2)
    }
} 