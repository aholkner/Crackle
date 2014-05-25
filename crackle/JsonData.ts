module crackle {

    export class JsonData {
        data: any

        constructor(public src: string) {
            ResourceQueue.current.loadJsonData(this)
        }
    }

} 