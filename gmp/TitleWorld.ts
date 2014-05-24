/// <reference path="_References.ts" />

module gmp {

    export class TitleWorld extends World {
        constructor(mapId: string) {
            super(mapId)
        }

        draw() {
            crackle.drawImage(Resources.titleImage, 0, 0, GameData.width, GameData.height)
        }
    }

}