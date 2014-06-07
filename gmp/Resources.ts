module gmp {

    export class Resources {

        static titleImage: crackle.Image
        static endImage: crackle.Image
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
            Resources.endImage = Resources.loadImage('end.png')
            var maps = [
                'act1',
                'act2',
                'act3',
                'act3_basement',
                'end',
                'hotel_basement',
                'hotel_ground',
                'hotel_l1',
                'hotel_l2',
                'combat1',
                'ui_win_combat',
                'ui_levelup']
            maps.forEach((id) => {
                Resources.tilemaps[id] = Resources.loadTilemap(id + '.json')
            })

            UI.load()
        }

    }

} 