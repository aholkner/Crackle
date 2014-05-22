class Resources {
    private static loadCount = 0;
    private static loadCompleteCallback;

    static loadImage(path: string): HTMLImageElement {
        var img = document.createElement('img')
        Resources.loadCount += 1
        img.onload = () => { this.onImageLoaded(img) }
        img.src = path
        return img
    }

    static completeLoad(callback) {
        Resources.loadCompleteCallback = callback;
    }

    private static onImageLoaded(img: HTMLImageElement) {
        Resources.loadCount -= 1
        if (Resources.loadCount == 0)
            Resources.loadCompleteCallback()
    }

} 

class ResourceNotLoadedException {
    constructor(public path: string)
    { }

}