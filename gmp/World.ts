module gmp {

    class Timeout {
        constructor(public timeout: number, public func: { () }) {
        }
    }

    export class World {
        map: Tilemap
        menuStack: Menu[] = []
        private timeouts: Timeout[] = []

        constructor(mapId: string) {
            if (mapId in Resources.mapData)
                this.map = new Tilemap(Resources.mapData[mapId])
        }

        start() {
        }

        update() {
            if (this.timeouts.length > 0) {
                this.timeouts.map((timeout) => timeout.timeout -= crackle.timestep)
                var expired = this.timeouts.filter((timeout) => timeout.timeout <= 0)
                if (expired.length > 0) {
                    this.timeouts = this.timeouts.filter((timeout) => timeout.timeout > 0)
                    expired.map((timeout) => timeout.func())
                }
            }
        }

        // Drawing

        tileSize: number = 16
        cameraX: number = 0
        cameraY: number = 0

        draw() {
            this.drawWorld()
            this.drawMenu()
            this.drawHud()
            this.drawStats()
        }

        drawWorld() {
            var ts = this.tileSize

            var viewport = new Rect(this.cameraX,
                this.cameraY,
                this.cameraX + game.mapWidth,
                this.cameraY + game.mapHeight)

            crackle.pushTransform()
            crackle.scale(game.mapScale, game.mapScale)
            crackle.translate(-viewport.x1, -viewport.y1)

            this.map.draw(viewport)
            //for sprite in this.sprites:
            //    if (sprite.effectDead)
            //    crackle.pushTransform()
            //        crackle.translate(sprite.x * ts + 4, sprite.y * ts + 4)
            //        crackle.rotate(-math.pi / 2)
            //        crackle.drawImage(sprite.image, -4, -4)
            //        crackle.popTransform()
            //    else:
            //        crackle.drawImage(sprite.image, sprite.x * ts, sprite.y * ts)

            crackle.popTransform()
            this.drawDialog()
        }

        drawDialog() {
            if (this.dialogText) {
                var ts = this.tileSize

                var viewport = new Rect(this.cameraX,
                    this.cameraY,
                    this.cameraX + game.mapWidth,
                    this.cameraY + game.mapHeight)

                var width = Math.min(game.width / 2, UI.font.measureString(this.dialogText))
                if (this.dialogSprite) {
                    var speakerX = (this.dialogSprite.x * ts - viewport.x1) * game.mapScale
                    var speakerY = (this.dialogSprite.y * ts - viewport.y1) * game.mapScale
                    UI.drawSpeechBox(this.dialogText, speakerX, speakerY)
                } else {
                    UI.drawMessageBox(this.dialogText)
                }
            }
        }

        drawMenu() {
            this.menuStack.map((menu) => { menu.draw() })
        }

        drawHud() {
            // TODO
        }

        drawStats() {
            // TODO
        }

        // Menu

        pushMenu(menu: Menu) {
            menu.layout()
            this.menuStack.push(menu)
        }

        popMenu() {
            this.menuStack.pop()
        }

        popAllMenus() {
            this.menuStack.splice(0)
        }

        // Script

        dialogSprite: any // TODO sprite
        dialogText: string

        after(timeout: number, func: { () }) {
            this.timeouts.push(new Timeout(timeout, func))
        }


        doDialog(sprite: any, text: string): boolean { // TODO sprite
            if (text.length > 0) {
                this.dialogSprite = sprite
                this.dialogText = text
                if (sprite)
                    console.log('%s says %s', sprite.name, text)
                else
                    console.log('message: %s', text)
                return true
            } else {
                return false
            }
        }

        // Input

        onDismissDialog() {
            // TODO this.continueScript()
        }

        onWorldKeyPressed(key: crackle.Key) {
        }

        onKeyPressed(key: crackle.Key) {
            if (this.timeouts.length > 0)
                return

            if (this.dialogText) {
                this.dialogText = null
                this.onDismissDialog()
                return
            }

            if (this.menuStack.length > 0) {
                this.menuStack[this.menuStack.length - 1].onKeyPressed(key)
            }

            this.onWorldKeyPressed(key)
        }

        onKeyReleased(key: crackle.Key) {
        }
    }

}