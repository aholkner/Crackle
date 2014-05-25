module gmp {

    export class Game extends crackle.Game {

        worldStack: World[] = []
        mapWorlds: { [mapId: string]: World } = {}

        mapScale: number = 4
        get mapWidth(): number { return Math.floor(this.width / this.mapScale) }
        get mapHeight(): number { return Math.floor(this.height / this.mapScale) }

        onLoad() {
            game = this
            Resources.load()
        }

        onInit() {
            this.gotoMap('act1')
            //this.gotoMap('title')
        }

        canLoadCheckpoint(): boolean {
            return false // TODO
        }

        loadCheckpoint() {
            return false // TODO
        }

        get world(): World {
            return this.worldStack[this.worldStack.length - 1]
        }

        pushWorld(world: World) {
            this.worldStack.push(world)
            world.start()
        }

        popWorld() {
            this.worldStack.pop()
        }

        gotoMap(mapId: string) {
            var world
            if (mapId in this.mapWorlds)
                world = this.mapWorlds[mapId]
            else if (mapId == 'title')
                world = new TitleWorld(mapId)
            else
                world = new MapWorld(mapId)

            this.mapWorlds[mapId] = world

            this.worldStack.splice(0)
            this.pushWorld(world)
            // TODO world.runScript(null, mapId)
        }

        onTick() {
            crackle.clear(0, 0, 0, 1)
            this.world.update()
            this.world.draw()
        }

        onKey(key: crackle.Key, pressed: boolean) {
            if (pressed) {
                this.world.onKeyPressed(key)
                Debug.onKeyPressed(key)
            } else {
                this.world.onKeyReleased(key)
            }
        }

    }

    export var game: Game

}