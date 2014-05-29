module crackle {

    export class ResourceQueue {
        private loadCompleteCallback

        totalCount: number = 0
        completedCount: number = 0

        private static instances: ResourceQueue[] = []

        constructor(callback?: { () }) {
            this.loadCompleteCallback = callback;
        }

        static push(resourceQueue: ResourceQueue) {
            ResourceQueue.instances.push(resourceQueue)
        }

        static pop() {
            var resourceQueue = ResourceQueue.instances.pop()
            if (resourceQueue.completedCount == resourceQueue.totalCount)
                resourceQueue.loadCompleteCallback && resourceQueue.loadCompleteCallback()
        }

        static endFrame() {
            while (ResourceQueue.instances.length > 0)
                ResourceQueue.pop()
        }

        static get current(): ResourceQueue {
            if (ResourceQueue.instances.length == 0)
                ResourceQueue.instances.push(new ResourceQueue())
            return ResourceQueue.instances[ResourceQueue.instances.length - 1]
        }

        private incrementCompletedCount() {
            this.completedCount += 1
            if (this.completedCount == this.totalCount)
                this.loadCompleteCallback && this.loadCompleteCallback()
        }

        loadImage(image: Image, path: string): HTMLImageElement {
            var img = document.createElement('img')
            this.totalCount += 1
            img.onload = () => { this.onImageLoaded(image) }
            img.onerror = () => { this.onImageError(image) }
            img.src = path
            return img
        }

        private onImageLoaded(image: Image) {
            ResourceQueue.push(this)
            image.onLoaded()
            ResourceQueue.pop()
            this.incrementCompletedCount()
        }

        private onImageError(image: Image) {
            // TODO
            throw new ResourceNotLoadedException(image.img.src)
        }

        loadFont(font: Font) {
            if (!font.isLoaded) {
                this.totalCount += 1
                window.setTimeout(() => { this.pollFontLoaded(font) }, 100)
            } else {
                font.onLoaded()
            }
        }

        private pollFontLoaded(font) {
            if (font.isLoaded) {
                ResourceQueue.push(this)
                font.onLoaded()
                ResourceQueue.pop()
                this.incrementCompletedCount()
            } else {
                window.setTimeout(() => { this.pollFontLoaded(font) }, 100)
            }
        }

        loadJson(src: string, callback: { (obj: {}) }) {
            this.loadXmlHttpRequest(src, (xhr) => {
                var text = xhr.responseText
                ResourceQueue.push(this)
                callback(JSON.parse(text))
                ResourceQueue.pop()
            })
        }

        loadText(src: string, callback: { (text: string) }) {
            this.loadXmlHttpRequest(src, (xhr) => {
                ResourceQueue.push(this)
                callback(xhr.responseText)
                ResourceQueue.pop()
            })
        }

        loadXml(src: string, callback: { (doc: Document) }) {
            this.loadXmlHttpRequest(src, (xhr) => {
                ResourceQueue.push(this)
                callback(xhr.responseXML)
                ResourceQueue.pop()
            })
        }

        private loadXmlHttpRequest(src: string, callback: { (xhr: XMLHttpRequest) }) {
            this.totalCount += 1
            var xhr = typeof XMLHttpRequest != 'undefined'
                ? new XMLHttpRequest()
                : new ActiveXObject('Microsoft.XMLHTTP');
            xhr.open('get', src, true);
            xhr.onreadystatechange = () => {
                var status;
                if (xhr.readyState == 4) {
                    status = xhr.status;
                    if (status == 200) {
                        callback(xhr)
                        this.incrementCompletedCount()
                    } else {
                        throw new ResourceNotLoadedException(src)
                    }
                }
            };
            xhr.send();
        }

    }

    export class ResourceNotLoadedException {
        constructor(public path: string)
        { }

    }
}