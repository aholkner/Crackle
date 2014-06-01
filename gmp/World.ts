module gmp {

    class Timeout {
        constructor(public timeout: number, public func: { () }) {
        }
    }

    export class Sprite {
        name: string = '??'
        effectDead: boolean = false
        scriptIndex: number = 0
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

        activeScript: ScriptRow[]
        activeScriptSprite: Sprite
        mapScriptSprite: Sprite
        currentCharacter: Character
        questName: string

        tileSize: number = 8
        cameraX: number = 0
        cameraY: number = 0

        playerSlots: Slot[] = [null, null, null, null]
        monsterSlots: Slot[] = [null, null, null, null]

        playerSprite: Sprite
        dialogSprite: Sprite
        dialogText: string

        private timeouts: Timeout[] = []

        constructor(mapId: string) {
            if (mapId in Resources.tilemaps) {
                this.map = Resources.tilemaps[mapId]

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

        getSpriteAt(x: number, y: number): Sprite {
            for (var i = 0; i < this.sprites.length; ++i) {
                var sprite = this.sprites[i]
                if (sprite.x == x && sprite.y == y)
                    return sprite
            }
            return null;
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
            if (text) {
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

        getScriptSprite(param: string): Sprite {
            return null
        }

        continueScript() {
            if (!this.activeScript)
                return

            var script = this.activeScript
            var sprite = this.activeScriptSprite
            var done = false
            while (!done && sprite.scriptIndex < script.length) {
                var scriptRow = script[sprite.scriptIndex]
                done = this.runScriptRow(sprite, scriptRow)
                sprite.scriptIndex += 1
            }

            if (sprite.scriptIndex >= script.length)
                this.activeScript = null
        }

        runScript(sprite: Sprite, trigger: string) {
            if (!(trigger in gameData.script))
                return
            if (!sprite)
                sprite = this.mapScriptSprite
            if (!sprite)
                sprite = this.mapScriptSprite = new Sprite(null, -100, -100)
            this.activeScript = gameData.script[trigger]
            this.activeScriptSprite = sprite
            this.continueScript()
        }

        runScriptRow(sprite: Sprite, scriptRow: ScriptRow) {
            var action = scriptRow.action
            if (action[0] == '#' || !action)
                return false

            var param = scriptRow.param
            var dialog = scriptRow.dialog
            if (action == 'Say') {
                if (param)
                    sprite = this.getScriptSprite(param)
                this.doDialog(sprite, dialog)
            } else if (action == 'PlayerSay') {
                this.doDialog(this.playerSprite, dialog)
            } else if (action == 'Message') {
                this.doDialog(null, dialog)
            } else if (action == 'QuestName') {
                this.questName = dialog
                return false
            } else if (action == 'Encounter') {
                game.pushWorld(new CombatWorld('combat1', param))
            } else if (action == 'Destroy') {
                this.sprites.remove(sprite)
                return false
            } else if (action == 'GiveItem') {
                game.questItems.push(gameData.questItems[param])
                return this.doDialog(null, dialog)
            } else if (action == 'GiveVotes') {
                var amount = parseInt(param)
                game.allies.forEach((ally) => {
                    ally.votes = Math.min(ally.votes + amount, ally.maxVotes)
                })
                return this.doDialog(null, dialog)
            } else if (action == 'GiveSpin') {
                amount = parseInt(param)
                game.allies.forEach((ally) => {
                    ally.spin = Math.min(ally.spin + amount, ally.maxSpin)
                })
                return this.doDialog(null, dialog)
            } else if (action == 'RestoreVotes') {
                game.allies.forEach((ally) => {
                    ally.votes = ally.maxVotes
                })
                return this.doDialog(null, dialog)
            } else if (action == 'RestoreSpin') {
                game.allies.forEach((ally) => {
                    ally.spin = ally.maxSpin
                })
                return this.doDialog(null, dialog)
            } else if (action == 'GiveMoney') {
                game.money += parseInt(param)
                return this.doDialog(null, dialog)
            } else if (action == 'RequireItem' || action == 'RequireItemMessage' || action == 'RequireItemPlayerSay') {
                if (game.questItems.findFirst((item) => item.id == param) || Debug.disableRequire) {
                    return false // satisfied, move to next line immediately
                } else {
                    var dialogSprite;
                    if (action == 'RequireItemMessage')
                        dialogSprite = null
                    else if (action == 'RequireItemPlayerSay')
                        dialogSprite = this.playerSprite
                    else
                        dialogSprite = sprite
                    this.doDialog(dialogSprite, dialog)
                    sprite.scriptIndex -= 1
                    this.activeScript = null
                }
            } else if (action == 'RequireFlag' || action == 'RequireFlagPlayerSay') {
                if (param in game.questFlags || Debug.disableRequire)
                    return false // satisfied, move to next line immediately
                else {
                    this.doDialog(action == 'RequireFlag' ? sprite : this.playerSprite, dialog)
                    sprite.scriptIndex -= 1
                    this.activeScript = null
                }
            } else if (action == 'SetFlag') {
                game.questFlags[param] = true
                return false
            } else if (action == 'UnsetFlag') {
                if (param in game.questFlags)
                    delete game.questFlags[param]
                return false
            } else if (action == 'Increment') {
                if (!(param in game.questVars))
                    game.questVars[param] = 0
                game.questVars[param] += 1
                return false
            } else if (action == 'RequireCount') {
                var value = 0
                var p = param.split(':')
                param = p[0].trim()
                var requiredValue = parseInt(p[1])
                if (param in game.questVars)
                    value = game.questVars[param]
                if (value >= requiredValue || Debug.disableRequire)
                    return false // satisfied
                else {
                    this.doDialog(sprite, dialog)
                    sprite.scriptIndex -= 1
                    this.activeScript = null
                }
            } else if (action == 'LearnAttack') {
                var character = game.player
                var attackId = param
                if (param.indexOf(':') != -1) {
                    var p = param.split(':')
                    var characterId = p[0]
                    var attackId = p[1]
                    character = game.getAlly(characterId)
                    if (!character) {
                        console.log('missing ally: ' + characterId)
                        return false
                    }
                }
                var attack = gameData.attacks[attackId]
                character.attacks.push(gameData.attacks[attackId])
                return this.doDialog(null, dialog)
            } else if (action == 'AddAlly') {
                var p = param.split(':')
                var characterId = p[0]
                var level = parseInt(p[1])
                game.allies.push(new Character(characterId, level, game.player.itemAttacks, false))
                return this.doDialog(null, dialog)
            } else if (action == 'RemoveAlly') {
                var ally = game.getAlly(param)
                if (ally)
                    game.allies.remove(ally)
                return this.doDialog(null, dialog)
            } else if (action == 'GotoMap') {
                game.gotoMap(param)
            } else if (action == 'BeginCombat') {
                this.beginRound()
            } else if (action == 'Shop') {
                // this.pushMenu(new ShopMenu(param)) TODO
                return true
            } else if (action == 'Label') {
                return false
            } else if (action == 'Reset' || action == 'Jump') {
                for (var i = 0; i < this.activeScript.length; ++i) {
                    var row = this.activeScript[i]
                    if (row.action == 'Label' && row.param == param) {
                        sprite.scriptIndex = i
                        break
                    }
                }
                return action == 'Reset'
            } else if (action == 'Save') {
                if (game.saveCheckpoint(param))
                    this.doDialog(null, 'Game saved.')
                else
                    this.doDialog(null, 'Error saving game, progress will be lost on exit')
            } else if (action == 'PlaySound') {
                // TODO
                return false
            } else if (action in ['CheatXP', 'CheatCunning', 'CheatWit', 'CheatFlair', 'CheatSpeed', 'CheatCharisma']) {
                var character = game.player
                var value = parseInt(param)
                if (param.indexOf(':') != -1) {
                    var p = param.split(':')
                    character = game.getAlly(p[0])
                    value = parseInt(p[1])
                }
                if (action == 'CheatXP') {
                    character.xp = value
                    // TODO character.level = getLevelForXp(game.player.xp)
                    // TODO levelRow = getLevelRow(character.level)
                    var levelRow: Level
                    character.maxSpin = levelRow.spin
                    character.maxVotes = levelRow.votes
                } else if (action == 'CheatCunning') {
                    character.cunning = value
                } else if (action == 'CheatWit') {
                    character.wit = value
                } else if (action == 'CheatFlair') {
                    character.flair = value
                } else if (action == 'CheatSpeed') {
                    character.speed = value
                } else if (action == 'CheatCharisma') {
                    character.charisma = value
                }
                return false
            } else {
                throw new AssertException('unsupported script action "' + action + '"')
            }

            // return false only if this script row performs no yielding UI
            return true
        }

        // Input

        onDismissDialog() {
            this.continueScript()
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

        // Combat interface

        beginRound() { }
    }

}