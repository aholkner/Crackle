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

        loadImage(image: Image, path: string): HTMLImageElement {
            var img = document.createElement('img')
            this.loadCount += 1
            img.onload = () => { this.onImageLoaded(image) }
            img.onerror = () => { this.onImageError(image) }
            img.src = path
            return img
        }

        private onImageLoaded(image: Image) {
            image.onLoaded()
            this.decrementLoadCount()
        }

        private onImageError(image: Image) {
            // TODO
            throw new ResourceNotLoadedException(image.img.src)
        }

        loadFont(font: Font) {
            if (!font.isLoaded) {
                this.loadCount += 1
                window.setTimeout(() => { this.pollFontLoaded(font) }, 100)
            } else {
                font.onLoaded()
            }
        }

        private pollFontLoaded(font) {
            if (font.isLoaded) {
                font.onLoaded()
                this.decrementLoadCount()
            } else {
                window.setTimeout(() => { this.pollFontLoaded(font) }, 100)
            }
        }
    }

    export class ResourceNotLoadedException {
        constructor(public path: string)
        { }

    }
}