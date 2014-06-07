module crackle {

    export class Game {
        element: HTMLElement
        canvas: HTMLCanvasElement

        lastTimestamp: number = -1
        width: number
        height: number

        resourceQueue: ResourceQueue
        isLoaded: boolean

        private keys: {} = {}
        
        constructor(element: HTMLElement) {
            init()
            
            this.isLoaded = false
            this.element = element
            this.canvas = document.createElement("canvas")
            this.canvas.width = element.offsetWidth
            this.canvas.height = element.offsetHeight
            this.element.appendChild(this.canvas)

            this.width = this.canvas.width
            this.height = this.canvas.height
        }

        run() {
            this.resourceQueue = new ResourceQueue(() => { this.onPreloadComplete() })
            ResourceQueue.push(this.resourceQueue)
            renderer.defaultFont = new Font('monospace', 10)
            this.onPreload()
            ResourceQueue.pop()
        }

        private onPreloadComplete() {
            this.resourceQueue = new ResourceQueue(() => { this.onLoadComplete() })
            ResourceQueue.push(this.resourceQueue)
            renderer.defaultFont = new Font('monospace', 10)
            this.onLoad()
            ResourceQueue.pop()

            window.requestAnimationFrame((timestamp) => { this.onAnimationFrame(timestamp) })
        }

        private onAnimationFrame(timestamp: number) {
            // Update crackle.timestep
            if (this.lastTimestamp > 0)
                crackle.timestep = (timestamp - this.lastTimestamp) / 1000.0 // ms to secs
            this.lastTimestamp = timestamp
            crackle.time = timestamp / 1000.0

            // Render frame
            renderer.beginFrame(this.canvas)
            if (this.isLoaded)
                this.onTick()
            else
                this.onPretick()
            renderer.endFrame()

            // Wait for loading complete
            ResourceQueue.endFrame()

            // Request next frame
            window.requestAnimationFrame((timestamp) => { this.onAnimationFrame(timestamp) })
        }

        private onLoadComplete() {
            this.isLoaded = true

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

            this.canvas.addEventListener('touchstart', (ev: any) => {
                if (ev.touches.length > 0)
                    this.onTouch(ev.touches[0].pageX - this.canvas.offsetLeft, ev.touches[0].pageY - this.canvas.offsetTop, ev.touches[0].identifier, true)
            })

            this.onInit()
        }

        public onPreload() {
        }

        public onPretick() {
            clear(1, 0, 0, 1)
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