module crackle {

    export class CanvasRenderer implements Renderer {

        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;

        private sampleNearest: boolean = false;

        public beginFrame(canvas: HTMLCanvasElement) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
        }

        public endFrame() {
            this.canvas = null;
            this.ctx = null;
        }

        public setColor(r: number, g: number, b: number, a: number) {
            this.ctx.fillStyle = 'rgba(' + r * 255 + ',' + g * 255 + ',' + b * 255 + ',' + a * 255 + ')'
        }

        public clear(r: number, g: number, b: number, a: number) {
            var restoreFillStyle = this.ctx.fillStyle
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            setColor(r, g, b, a)
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
            this.ctx.fillStyle = restoreFillStyle
        }

        public drawImage(image: Image, x1: number, y1: number, x2: number, y2: number) {
            this.ctx.msImageSmoothingEnabled = !image.params.sampleNearest
            this.ctx.drawImage(image.img, x1, y1, x2 - x1, y2 - y1)
        }
    }
}