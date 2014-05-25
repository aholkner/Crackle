/// <reference path="_References.ts" />

module gmp {

    export class MapWorld extends World {

        update() {
            
            this.updateCamera()
        }

        updateCamera() {
            var ts = this.tileSize

            //if (this.playerSprite)
            //    this.cameraX = this.playerSprite.x * ts - mapWidth / 2
            //    this.cameraY = this.playerSprite.y * ts - mapHeight / 2 + 2 * ts
            //    this.cameraX = clamp(this.cameraX, 0, this.map.tileWidth * this.map.cols - mapWidth)
            //    this.cameraY = clamp(this.cameraY, 0, this.map.tileHeight * this.map.rows - mapHeight)
            //else:
            //    this.cameraX = this.cameraY = 0
        }

    }

}