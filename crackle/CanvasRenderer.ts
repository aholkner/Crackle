﻿module crackle {

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

        private canvas: HTMLCanvasElement;
        private ctx: CanvasRenderingContext2D;
        private ctxExtensions: ICanvasRenderingContext2DExtensions;

        private sampleNearest: boolean = false;

        public beginFrame(canvas: HTMLCanvasElement) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');

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
            this.ctxExtensions.setImageSmoothingEnabled(this.ctx, !image.params.sampleNearest)
            this.ctx.drawImage(image.img, x1, y1, x2 - x1, y2 - y1)
        }
    }
}