/// <reference path="_References.ts" />

module gmp {

    export class MapWorld extends World {

        private moveTimeout: number = -1

        private playerSprite: Sprite
        
        constructor(mapId: string) {
            super(mapId)

            var playerSlot = this.playerSlots[0]
            if (playerSlot != null)
                this.playerSprite = this.addSprite(game.player.image, playerSlot.x, playerSlot.y, 'Player')

        }

        update() {
            super.update()
            this.updateCamera()
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