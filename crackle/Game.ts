module crackle {

    export class Game {
        element: HTMLElement
        canvas: HTMLCanvasElement

        lastTimestamp: number = -1
        width: number
        height: number

        resourceQueue: ResourceQueue
        
        constructor(element: HTMLElement) {
            init()

            this.element = element
            this.canvas = document.createElement("canvas")
            this.canvas.width = element.offsetWidth
            this.canvas.height = element.offsetHeight
            this.element.appendChild(this.canvas)

            this.width = this.canvas.width
            this.height = this.canvas.height
        }

        run() {
            ResourceQueue.push(new ResourceQueue(() => { this.onLoadComplete() }))
            this.onLoad()
            ResourceQueue.pop()
        }

        private onAnimationFrame(timestamp: number) {
            // Update crackle.timestep
            if (this.lastTimestamp > 0)
                crackle.timestep = (timestamp - this.lastTimestamp) / 1000.0 // ms to secs
            this.lastTimestamp = timestamp

            // Render frame
            renderer.beginFrame(this.canvas)
            this.onTick()
            renderer.endFrame()

            // Request next frame
            window.requestAnimationFrame((timestamp) => { this.onAnimationFrame(timestamp) })
        }

        private onLoadComplete() {
            this.onInit()
            window.requestAnimationFrame((timestamp) => { this.onAnimationFrame(timestamp) })
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