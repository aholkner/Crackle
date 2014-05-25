module crackle {

    export class Game {
        element: HTMLElement
        canvas: HTMLCanvasElement

        lastTimestamp: number = -1
        width: number
        height: number

        resourceQueue: ResourceQueue

        private keys: {} = {}
        
        constructor(element: HTMLElement) {
            init()

            this.element = element
            this.canvas = document.createElement("canvas")
            this.canvas.width = element.offsetWidth
            this.canvas.height = element.offsetHeight
            this.element.appendChild(this.canvas)

            this.width = this.canvas.width
            this.height = this.canvas.height

            document.addEventListener('keydown', (ev) => {
                if (!(ev.keyCode in this.keys)) {
                    this.keys[ev.keyCode] = true
                    this.onKey(<Key>ev.keyCode, true)
                }
            })

            document.addEventListener('keyup', (ev) => {
                delete this.keys[ev.keyCode]
                this.onKey(<Key>ev.keyCode, false)
            })

            this.canvas.addEventListener('mousedown', (ev) => {
                this.onMouse(ev.clientX - this.canvas.offsetLeft, ev.clientY - this.canvas.offsetTop, ev.button, true)
            })

            this.canvas.addEventListener('touchstart', (ev:any) => {
                if (ev.touches.length > 0)
                    this.onTouch(ev.touches[0].pageX - this.canvas.offsetLeft, ev.touches[0].pageY - this.canvas.offsetTop, ev.touches[0].identifier, true)
            })
        }

        run() {
            ResourceQueue.push(new ResourceQueue(() => { this.onLoadComplete() }))
            renderer.defaultFont = new Font('monospace', 10)
            this.onLoad()
            ResourceQueue.pop()
        }

        private onAnimationFrame(timestamp: number) {
            // Update crackle.timestep
            if (this.lastTimestamp > 0)
                crackle.timestep = (timestamp - this.lastTimestamp) / 1000.0 // ms to secs
            this.lastTimestamp = timestamp
            crackle.time = timestamp / 1000.0

            // Render frame
            renderer.beginFrame(this.canvas)
            this.onTick()
            renderer.endFrame()

            // Wait for loading complete
            ResourceQueue.endFrame()

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
            clear(1, 0, 1, 1)
        }

        public onKey(key: Key, pressed: boolean) {
            // Subclass can handle key event
        }

        public onMouse(x: number, y: number, button: number, pressed: boolean) {
            // Subclass can handle mouse event
        }

        public onTouch(x: number, y: number, touch: number, pressed: boolean) {
            // Subclass can handle mouse event
        }

    }

}