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
            ResourceQueue.instances.pop()
        }

        static get current(): ResourceQueue {
            if (ResourceQueue.instances.length > 0)
                return ResourceQueue.instances[ResourceQueue.instances.length - 1]
            return null
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
            this.loadCount -= 1
            if (this.loadCount == 0)
                this.loadCompleteCallback()
        }

        private onImageError(img: HTMLImageElement) {
            // TODO
            throw new ResourceNotLoadedException(img.src)
        }
    }

    export class ResourceNotLoadedException {
        constructor(public path: string)
        { }

    }
}