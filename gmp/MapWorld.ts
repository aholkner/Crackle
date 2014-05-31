/// <reference path="_References.ts" />

module gmp {

    export class MapWorld extends World {

        private moveTimeout: number = -1
        
        constructor(mapId: string) {
            super(mapId)

            var playerSlot = this.playerSlots[0]
            if (playerSlot != null)
                this.playerSprite = this.addSprite(game.player.image, playerSlot.x, playerSlot.y, 'Player')
        }

        update() {
            super.update()
            if (this.moveTimeout > 0) {
                this.moveTimeout -= crackle.timestep
                if (this.moveTimeout <= 0) {
                    var dx = 0
                    var dy = 0
                    if (<number>crackle.Key.left in crackle.keys)
                        dx -= 1
                    if (<number>crackle.Key.right in crackle.keys)
                        dx += 1
                    if (<number>crackle.Key.up in crackle.keys)
                        dy -= 1
                    if (<number>crackle.Key.down in crackle.keys)
                        dy += 1
                    
                    this.move(dx, dy)
                }
            }
            this.updateCamera()
        }

        onWorldKeyPressed(key: crackle.Key) {
            var dx = 0
            var dy = 0
            if (key == crackle.Key.left)
                dx -= 1
            else if (key == crackle.Key.right)
                dx += 1
            else if (key == crackle.Key.up)
                dy -= 1
            else if (key == crackle.Key.down)
                dy += 1
            this.move(dx, dy)

            //if (key == crackle.Key.esc)
            //    this.pushMenu(new MapMenu(this))
        }

        onKeyreleased(key: crackle.Key) {
            this.moveTimeout = -1
        }


        move(dx: number, dy: number) {
            this.moveTimeout = 0.2
            if (dx != 0 && dy != 0) {
                this.move(dx, 0)
                this.move(0, dy)
                return
            }

            var other = this.getSpriteAt(this.playerSprite.x + dx, this.playerSprite.y + dy)
            if (other)
                this.onCollide(other)
            else {
                var x = this.playerSprite.x
                var y = this.playerSprite.y
                if (x + dx < 0 || x + dx >= this.map.cols ||
                    y + dy < 0 || y + dy >= this.map.rows)
                    return

                var tileIndex = this.map.getTileIndex(x * this.tileSize,
                    y * this.tileSize)
                var nextTileIndex = this.map.getTileIndex((x + dx) * this.tileSize,
                    (y + dy) * this.tileSize)
                for (var layerIndex = 0; layerIndex < this.map.layers.length; ++layerIndex) {
                    var layer = this.map.layers[layerIndex]
                    if (!(layer instanceof TilemapTileLayer))
                        continue

                    var tile = (<TilemapTileLayer>layer).tiles[tileIndex]
                    var nextTile = (<TilemapTileLayer>layer).tiles[nextTileIndex]

                    var c = this.getTileCollision(tile)
                    var nextC = this.getTileCollision(nextTile)

                    if (!Debug.disableCollision) {
                        if (dx < 0 && this.checkCollisionFlags(c, 'l', nextC, 'r'))
                            return
                        else if (dx > 0 && this.checkCollisionFlags(c, 'r', nextC, 'l'))
                            return
                        else if (dy < 0 && this.checkCollisionFlags(c, 'u', nextC, 'd'))
                            return
                        else if (dy > 0 && this.checkCollisionFlags(c, 'd', nextC, 'u'))
                            return
                    }
                }

                this.playerSprite.x += dx
                this.playerSprite.y += dy
            }
        }

        private checkCollisionFlags(c: string, checkC: string, nextC: string, checkNextC: string): boolean {
            return c.indexOf(checkC) != -1 || nextC.indexOf(checkNextC) != -1
        }

        private getTileCollision(tile: Tile): string {
            if (tile == null || !tile.properties)
                return ''
            if (!('c' in tile.properties))
                return ''
            var c = tile.properties['c']
            if (!c)
                c = 'udlr'
            return c
        }

        onCollide(other: Sprite) {
            if (other.name in gameData.script)
                this.runScript(other, other.name)
        }

        updateCamera() {
            var ts = this.tileSize

            if (this.playerSprite) {
                this.cameraX = this.playerSprite.x * ts - game.mapWidth / 2
                this.cameraY = this.playerSprite.y * ts - game.mapHeight / 2 + 2 * ts
                this.cameraX = Math.clamp(this.cameraX, 0, this.map.tileWidth * this.map.cols - game.mapWidth)
                this.cameraY = Math.clamp(this.cameraY, 0, this.map.tileHeight * this.map.rows - game.mapHeight)
            } else {
                this.cameraX = this.cameraY = 0
            }
        }

    }

}