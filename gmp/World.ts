module gmp {

    class Timeout {
        constructor(public timeout: number, public func: { () }) {
        }
    }

    export class World {
        menuStack: Menu[] = []
        private timeouts: Timeout[] = []

        constructor(mapId: string) {
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
        cameraX: number
        cameraY: number

        draw() {
            this.drawWorld()
            this.drawMenu()
            this.drawHud()
            this.drawStats()
        }

        drawWorld() {
            // TODO

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