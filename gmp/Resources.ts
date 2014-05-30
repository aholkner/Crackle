module gmp {

    export class Resources {

        static titleImage: crackle.Image
        static tilemaps: { [mapId: string]: Tilemap } = {}
        static characterImages: { [name: string]: crackle.Image } = {} 
        static spreadsheet: GoogleSpreadsheet

        static loadImage(name: string): crackle.Image {
            return new crackle.Image('gmp/res/' + name, { sampleNearest: true })
        }

        static loadTilemap(name: string): Tilemap {
            return new Tilemap('gmp/res/' + name)
        }

        static load() {
            Resources.titleImage = Resources.loadImage('title.png')
            Resources.tilemaps['act1'] = Resources.loadTilemap('act1.json')

            UI.load()
        }

    }

} 