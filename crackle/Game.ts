module crackle {

    export class Game {
        element: HTMLElement;
        canvas: HTMLCanvasElement;

        width: number;  // TODO belongs in window?
        height; number;
        
        constructor(element: HTMLElement) {
            init()

            this.element = element;
            this.canvas = document.createElement("canvas");
            this.canvas.width = element.offsetWidth
            this.canvas.height = element.offsetHeight
            this.element.appendChild(this.canvas);

            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }

        run() {
            this.onLoad()
            Resources.completeLoad(() => { this.onLoadComplete() })
        }

        private onAnimationFrame() {
            renderer.beginFrame(this.canvas)
            this.onTick()
            renderer.endFrame()
            window.requestAnimationFrame(() => { this.onAnimationFrame() })
        }

        private onLoadComplete() {
            this.onInit()
            window.requestAnimationFrame(() => { this.onAnimationFrame() })
        }

        public onLoad() {
            // Subclass should load required assets here
        }

        public onInit() {
            // Subclass should init here; all assets have loaded
        }

        public onTick() {
            clear(255, 0, 255, 255)
        }

    }

}