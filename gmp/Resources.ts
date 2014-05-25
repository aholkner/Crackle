module gmp {

    export class Resources {

        static titleImage: crackle.Image
        static mapData: { [mapName: string]: crackle.JsonData } = {}
        static characterImages: { [name: string]: crackle.Image } = {} 

        static loadImage(name: string): crackle.Image {
            return new crackle.Image('gmp/res/' + name, { sampleNearest: true })
        }

        static loadJson(name: string) {
            return new crackle.JsonData('gmp/res/' + name)
        }

        static load() {
            Resources.titleImage = Resources.loadImage('title.png')
            Resources.mapData['act1'] = Resources.loadJson('act1.json')

            UI.load()
        }

    }

} 