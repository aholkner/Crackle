module gmp {

    class Timeout {
        constructor(public timeout: number, public func: { () }) {
        }
    }

    export class Sprite {
        name: string = '??'
        effectDead: boolean
        scriptIndex: number
        properties: { [key: string]: any }

        constructor(public image: crackle.Image, public x: number, public y: number) {
        }
    }

    export class Slot {
        character: Character
        sprite: Sprite

        constructor(public x: number, public y: number) {
        }
    }

    export class World {
        map: Tilemap
        menuStack: Menu[] = []
        sprites: Sprite[] = []

        activeScript: any // TODO
        activeScriptSprite: Sprite
        mapScriptSprite: Sprite // TODO
        currentCharacter: Character
        questName: string

        tileSize: number = 16
        cameraX: number = 0
        cameraY: number = 0

        playerSlots: Slot[] = [null, null, null, null]
        monsterSlots: Slot[] = [null, null, null, null]

        dialogSprite: Sprite
        dialogText: string

        private timeouts: Timeout[] = []

        constructor(mapId: string) {
            if (mapId in Resources.mapData) {
                this.map = new Tilemap(Resources.mapData[mapId])

                this.map.layers.forEach((layer) => {
                    if (!(layer instanceof TilemapObjectLayer))
                        return
                        
                    (<TilemapObjectLayer>layer).objects.forEach((obj:TilemapObject) => {
                        var x = obj.x / this.tileSize
                        var y = obj.y / this.tileSize
                        if (obj.tile != null)
                            this.addSprite(obj.tile.image, x, y - 1, obj.name, obj.tile.properties)
                    })
                })
            }
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

        addSprite(image: crackle.Image, x: number, y: number, name?: string, properties?: { [key: string]: any }): Sprite {
            if (properties != null) {
                if ('player_slot' in properties) {
                    this.playerSlots[Math.floor(properties['player_slot']) - 1] = new Slot(x, y)
                    return null
                }
                else if ('monster_slot' in properties) {
                    this.monsterSlots[Math.floor(properties['monster_slot']) - 1] = new Slot(x, y)
                    return null
                }
            }

            var sprite = new Sprite(image, x, y)
            sprite.properties = properties
            sprite.name = name
            this.sprites.push(sprite)
            return sprite
        }

        // Drawing

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
            this.sprites.forEach((sprite) => {
                if (sprite.effectDead) {
                    crackle.pushTransform()
                    crackle.translate(sprite.x * ts + 4, sprite.y * ts + 4)
                    crackle.rotate(-Math.PI / 2)
                    crackle.drawImage(sprite.image, -4, -4)
                    crackle.popTransform()
                } else {
                    crackle.drawImage(sprite.image, sprite.x * ts, sprite.y * ts)
                }
            })

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