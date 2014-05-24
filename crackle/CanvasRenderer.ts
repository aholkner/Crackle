module crackle {

    interface ICanvasRenderingContext2DExtensions {
        setImageSmoothingEnabled(ctx: CanvasRenderingContext2D, enabled: boolean)
    }

    class DummyCanvasRenderingContext2DExtensions implements ICanvasRenderingContext2DExtensions {
        setImageSmoothingEnabled(ctx: CanvasRenderingContext2D, enabled: boolean) {
        }
    }

    class MozCanvasRenderingContext2DExtensions implements ICanvasRenderingContext2DExtensions {
        setImageSmoothingEnabled(ctx: CanvasRenderingContext2D, enabled: boolean) {
            (<any>ctx).mozImageSmoothingEnabled = enabled
        }
    }

    class MSCanvasRenderingContext2DExtensions implements ICanvasRenderingContext2DExtensions {
        setImageSmoothingEnabled(ctx: CanvasRenderingContext2D, enabled: boolean) {
            ctx.msImageSmoothingEnabled = enabled
        }
    }

    class CanvasRenderingContext2DExtensions implements ICanvasRenderingContext2DExtensions {
        setImageSmoothingEnabled(ctx: CanvasRenderingContext2D, enabled: boolean) {
            (<any>ctx).imageSmoothingEnabled = enabled
        }
    }

    class WebkitCanvasRenderingContext2DExtensions implements ICanvasRenderingContext2DExtensions {
        setImageSmoothingEnabled(ctx: CanvasRenderingContext2D, enabled: boolean) {
            (<any>ctx).webkitImageSmoothingEnabled = enabled
        }
    }

    export class CanvasRenderer implements Renderer {
        public defaultFont: Font

        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        private ctxExtensions: ICanvasRenderingContext2DExtensions;

        private sampleNearest: boolean = false;

        public beginFrame(canvas: HTMLCanvasElement) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.ctx.setTransform(1, 0, 0, 1, 0, 0)

            if (this.ctxExtensions == null) {
                if ('mozImageSmoothingEnabled' in this.ctx)
                    this.ctxExtensions = new MozCanvasRenderingContext2DExtensions()
                else if ('msImageSmoothingEnabled' in this.ctx)
                    this.ctxExtensions = new MSCanvasRenderingContext2DExtensions()
                else if ('webkitImageSmoothingEnabled' in this.ctx)
                    this.ctxExtensions = new WebkitCanvasRenderingContext2DExtensions()
                else if ('imageSmoothingEnabled' in this.ctx)
                    this.ctxExtensions = new CanvasRenderingContext2DExtensions()
                else
                    this.ctxExtensions = new DummyCanvasRenderingContext2DExtensions() // TODO browser unsupported
            }
        }

        public endFrame() {
            this.canvas = null;
            this.ctx = null;
        }

        translate(x: number, y: number) {
            this.ctx.translate(x, y)
        }

        scale(x: number, y: number) {
            this.ctx.scale(x, y)
        }

        rotate(radians: number) {
            this.ctx.rotate(-radians)
        }

        pushTransform() {
            this.ctx.save()
        }

        popTransform() {
            this.ctx.restore()
        }

        public setColor(r: number, g: number, b: number, a: number) {
            this.ctx.fillStyle = 'rgba(' + Math.floor(r * 255) + ',' + Math.floor(g * 255) + ',' + Math.floor(b * 255) + ',' + a + ')'
        }

        public clear(r: number, g: number, b: number, a: number) {
            var restoreFillStyle = this.ctx.fillStyle
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            setColor(r, g, b, a)
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
            this.ctx.fillStyle = restoreFillStyle
        }

        public drawImageRegion(image: Image, x: number, y: number, width: number, height: number, sx: number, sy: number, swidth: number, sheight: number) {
            this.ctxExtensions.setImageSmoothingEnabled(this.ctx, !image.params.sampleNearest)
            this.ctx.drawImage(image.img, sx, sy, swidth, sheight, x, y, width, height)
        }

        public drawString(font: Font, text: string, x: number, y: number) {
            this.ctx.font = font.specifier
            this.ctx.fillText(text, x, y)
        }

        public measureString(font: Font, text: string) {
            // Measure with context
            this.ctx.font = font.specifier
            return this.ctx.measureText(text).width
        }
    }
}