/// <reference path="_References.ts" />

module gmp {

    export class Game extends crackle.Game {

        worldStack: World[] = []
        mapWorlds: { [mapId: string]: World } = {}
        player: Character
        allies: Character[]

        mapScale: number = 4
        get mapWidth(): number { return Math.floor(this.width / this.mapScale) }
        get mapHeight(): number { return Math.floor(this.height / this.mapScale) }

        onLoad() {
            game = this
            Resources.load()
        }

        onInit() {
            this.loadCharacterSprites()

            this.player = new Character('Player', 1, [], false)
            this.allies = [this.player]

            this.gotoMap('act1')
            //this.gotoMap('title')
        }

        loadCharacterSprites() {
            var tilemap = new Tilemap(Resources.mapData['act1'])
            tilemap.tilesets.forEach((tileset) => {
                tileset.tiles.forEach((tile) => {
                    if (tile.properties != null && 'character' in tile.properties)
                        Resources.characterImages[tile.properties['character']] = tile.image
                })
            })
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

        // Touch emulates directional keys
        onTouch(x: number, y: number, touch: number, pressed: boolean) {
            if (pressed) {
                if (x < this.width / 3)
                    this.onKey(crackle.Key.left, true)
                else if (x > this.width * 2 / 3)
                    this.onKey(crackle.Key.right, true)
                else if (y < this.height / 3)
                    this.onKey(crackle.Key.up, true)
                else if (y > this.height * 2 / 3)
                    this.onKey(crackle.Key.down, true)
                else
                    this.onKey(crackle.Key.enter, true)
            }
        }


    }

    export var game: Game

}