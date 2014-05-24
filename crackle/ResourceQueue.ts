module crackle {

    export class ResourceQueue {
        private loadCount: number = 0
        private loadCompleteCallback

        private static instances: ResourceQueue[] = []

        constructor(callback) {
            this.loadCompleteCallback = callback;
        }

        static push(resourceQueue: ResourceQueue) {
            ResourceQueue.instances.push(resourceQueue)
        }

        static pop() {
            var resourceQueue = ResourceQueue.instances.pop()
            if (resourceQueue.loadCount == 0)
                resourceQueue.loadCompleteCallback()
        }

        static get current(): ResourceQueue {
            if (ResourceQueue.instances.length > 0)
                return ResourceQueue.instances[ResourceQueue.instances.length - 1]
            return null
        }

        private decrementLoadCount() {
            this.loadCount -= 1
            if (this.loadCount == 0)
                this.loadCompleteCallback()
        }

        loadImage(path: string): HTMLImageElement {
            var img = document.createElement('img')
            this.loadCount += 1
            img.onload = () => { this.onImageLoaded(img) }
            img.onerror = () => { this.onImageError(img) }
            img.src = path
            return img
        }

        private onImageLoaded(img: HTMLImageElement) {
            this.decrementLoadCount()
        }

        private onImageError(img: HTMLImageElement) {
            // TODO
            throw new ResourceNotLoadedException(img.src)
        }

        loadFont(font: Font) {
            if (!font.isLoaded) {
                this.loadCount += 1
                window.setTimeout(() => { this.pollFontLoaded(font) }, 100)
            }
        }

        private pollFontLoaded(font) {
            if (font.isLoaded)
                this.decrementLoadCount()
            else
                window.setTimeout(() => { this.pollFontLoaded(font) }, 100)
        }
    }

    export class ResourceNotLoadedException {
        constructor(public path: string)
        { }

    }
}