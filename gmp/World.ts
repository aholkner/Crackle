module gmp {

    export class World {
        menuStack: Menu[] = []
        //TODO timeouts: Timeout[] = []

        constructor(mapId: string) {
        }

        start() {
        }

        update() {
        }

        draw() {
        }

        onWorldKeyPressed(key: crackle.Key) {
        }

        onKeyPressed(key: crackle.Key) {
            this.onWorldKeyPressed(key)
        }

        onKeyReleased(key: crackle.Key) {
        }
    }

}