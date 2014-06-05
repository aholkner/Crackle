/// <reference path="_References.ts" />

module gmp {
        
    export class GameOverMenu extends Menu {
        constructor(world: World) {
            super(world)
            this.title = 'You are defeated'
            this.canDismiss = false
            this.items.push(new MenuItem('Restart this encounter', 'You failed this time, but next time the dice rolls may be in your favour', () => { this.onRestartEncounter() }))
            this.items.push(new MenuItem('Quit game', 'Exit the game', () => { this.onQuit() } ))
        }

        onRestartEncounter() {
            (<CombatWorld>this.world).restart()
        }

        onQuit() {
            // TODO crackle.quit()
        }
    }

    export class WinCombatWorld extends World {
        combatWorld: CombatWorld
        characters: Character[]
        queuedDialogs: World[]

        constructor(combatWorld: CombatWorld) {
            super('ui_win_combat')
            this.combatWorld = combatWorld
            this.characters = game.allies.slice()
            this.queuedDialogs = []

            // actually award results
            var encounter = this.combatWorld.encounter
            for (var i = 0; i < encounter.itemAttackDrops.length; ++i) {
                var ia = encounter.itemAttackDrops[i]
                for (var j = 0; j < ia.quantity; ++j)
                    ItemAttack.addAttackToItemAttackList(game.player.itemAttacks, ia.attack)
            }

            // generate xp per character
            var perCharacterXp = encounter.xp / this.characters.length
            game.money += encounter.money
            for (var i = 0; i < this.characters.length; ++i) {
                var character = this.characters[i]
                if (gameData.getLevelForXP(character.xp + perCharacterXp) != character.level)
                    this.queuedDialogs.push(new LevelUpWorld(character, this, perCharacterXp))
                else
                    character.xp += perCharacterXp
            }
        }

        draw() {
            var encounter = this.combatWorld.encounter
            this.combatWorld.draw()

            var width = game.width / 2
            var height = UI.font.height * 3
            if (encounter.money)
                height += UI.font.height
            if (encounter.itemAttackDrops)
                height += UI.font.height * (encounter.itemAttackDrops.length + 2)

            var cx = game.width / 2
            var cy = game.height / 2
            var x1 = cx - width / 2
            var y1 = cy - height / 2
            var x2 = cx + width / 2
            var y2 = cy + height / 2

            // background
            UI.drawBox(new Rect(x1, y1, x2, y2), UI.whiteBorder)

            var y = y1

            // title
            UI.drawBox(new Rect(x1, y1, x2, y1 + UI.font.height), UI.floaterBorderRed)
            crackle.drawString(UI.font, 'Victory!', cx, y, { align: crackle.Align.center, verticalAlign: crackle.VerticalAlign.top })
            y += UI.font.height + 16

            // xp
            crackle.setColor(0, 0, 0, 1)
            crackle.drawString(UI.font, 'XP Reward: ' + encounter.xp, x1, y, { align: crackle.Align.left, verticalAlign: crackle.VerticalAlign.top })
            if (encounter.money) {
                y += UI.font.height
                crackle.drawString(UI.font, 'Kickback: $' + encounter.money, x1, y, { align: crackle.Align.left, verticalAlign: crackle.VerticalAlign.top })
            }
            y += UI.font.height * 2

            if (encounter.itemAttackDrops.length > 0) {
                crackle.drawString(UI.font, 'Loot:', x1, y, { align: crackle.Align.left, verticalAlign: crackle.VerticalAlign.top })
                y += UI.font.height

                for (var i = 0; i < encounter.itemAttackDrops.length; ++i) {
                    var ia = encounter.itemAttackDrops[i]
                    var name
                    if (ia.quantity == 1)
                        name = ia.attack.name
                    else
                        name = ia.attack.name + ' (x' + ia.quantity + ')'
                    crackle.drawString(UI.font, name, x1 + 32, y, { align: crackle.Align.left, verticalAlign: crackle.VerticalAlign.top })
                    y += UI.font.height
                }
            }

            crackle.setColor(1, 1, 1, 1)
        }

        onWorldKeyPressed(key: crackle.Key) {
            this.next()
        }

        onLevelUpWorldDismissed() {
            this.next()
        }

        next() {
            if (this.queuedDialogs.length > 0)
                game.pushWorld(this.queuedDialogs.shift())
            else
                this.dismiss()
        }

        dismiss() {
            this.combatWorld.reset()
            game.popWorld()
            game.popWorld()
            game.world.continueScript()
        }
    }

    class AssignSkillPointsMenu extends Menu {
        cunningItem: MenuItem
        witItem: MenuItem
        charismaItem: MenuItem
        flairItem: MenuItem
        speedItem: MenuItem
        doneItem: MenuItem

        constructor(public levelUpWorld: LevelUpWorld) {
            super(levelUpWorld)
            this.canDismiss = false
            this.enableBorder = false
            this.cunningItem = new MenuItem('Cunning', 'Effectiveness of standard attacks')
            this.witItem = new MenuItem('Wit', 'Effectiveness of spin attacks')
            this.charismaItem = new MenuItem('Charisma', 'Defense against opponent\'s attacks')
            this.flairItem = new MenuItem('Flair', 'Chance of critical attack')
            this.speedItem = new MenuItem('Speed', 'Determines order in battle')
            this.doneItem = new MenuItem('Done', 'Finish assigning skill points', () => { this.onDone() }, false)
            this.items.push(this.cunningItem)
            this.items.push(this.witItem)
            this.items.push(this.charismaItem)
            this.items.push(this.flairItem)
            this.items.push(this.speedItem)
            this.items.push(this.doneItem)
            for (var i = 0; i < this.items.length; ++i)
                (<any>this.items[i]).skillPointsAdded = 0

            this.formatMenuItems()
        }

        onKeyPressed(key: crackle.Key) {
            if (this.selectedItem == this.doneItem) {
                super.onKeyPressed(key)
                return
            }

            if (key == crackle.Key.up)
                this.moveSelection(-1)
            else if (key == crackle.Key.down)
                this.moveSelection(1)
            else if (key == crackle.Key.left)
                this.alterSelection(-1)
            else if (key == crackle.Key.right)
                this.alterSelection(1)
        }

        alterSelection(amount: number) {
            if (amount > 0 && this.levelUpWorld.skillPoints == 0)
                return
            else if (amount < 0 && (<any>this.selectedItem).skillPointsAdded == 0)
                return

            (<any>this.selectedItem).skillPointsAdded += amount
            this.levelUpWorld.skillPoints -= amount
            this.formatMenuItems()
        }

        formatMenuItem(menuItem: MenuItem, name: string, value: number) {
            menuItem.name = '< ' + name + ': ' + value + ' +' + (<any>menuItem).skillPointsAdded + ' >'
            menuItem.enabled = (<any>menuItem).skillPointsAdded > 0 || this.levelUpWorld.skillPoints > 0
        }

        formatMenuItems() {
            this.formatMenuItem(this.cunningItem, 'Cunning', this.levelUpWorld.character.cunning)
            this.formatMenuItem(this.witItem, 'Wit', this.levelUpWorld.character.wit)
            this.formatMenuItem(this.charismaItem, 'Charisma', this.levelUpWorld.character.charisma)
            this.formatMenuItem(this.flairItem, 'Flair', this.levelUpWorld.character.flair)
            this.formatMenuItem(this.speedItem, 'Speed', this.levelUpWorld.character.speed)
            this.doneItem.enabled = this.levelUpWorld.skillPoints == 0
        }

        onDone() {
            this.levelUpWorld.character.cunning += (<any>this.cunningItem).skillPointsAdded
            this.levelUpWorld.character.wit += (<any>this.witItem).skillPointsAdded
            this.levelUpWorld.character.charisma += (<any>this.charismaItem).skillPointsAdded
            this.levelUpWorld.character.flair += (<any>this.flairItem).skillPointsAdded
            this.levelUpWorld.character.speed += (<any>this.speedItem).skillPointsAdded
            this.levelUpWorld.dismiss()
        }

        activateMenuItemColor(selected: boolean, enabled: boolean) {
            var m: number
            if (enabled) {
                if (selected)
                    m = 1
                else
                    m = 0
                crackle.setColor(m * 202.0 / 255, m * 72.0 / 255, m * 79.0 / 255, 1)
            }
            else {
                if (selected)
                    m = 0.5
                else
                    m = 0.7
                crackle.setColor(m, m, m, 1)
            }
        }
    }

    export class LevelUpWorld extends World {
        addXp: number
        character: Character
        winCombatWorld: WinCombatWorld
        skillPoints: number

        width: number
        height: number
        cx: number
        cy: number
        x1: number
        y1: number
        x2: number
        y2: number

        constructor(character: Character, winCombatWorld: WinCombatWorld, addXp: number) {
            super('UILevelup')
            this.addXp = addXp
            this.character = character
            this.winCombatWorld = winCombatWorld
        }

        start() {
            this.character.xp += this.addXp
            var level = gameData.getLevelForXP(this.character.xp)
            var levelRow = gameData.levels[level - 1]
            this.character.level = level
            this.character.maxSpin = levelRow.spin
            this.character.maxVotes = levelRow.votes
            this.skillPoints = levelRow.skillPoints
            this.pushMenu(new AssignSkillPointsMenu(this))
            this.layout()
        }

        layout() {
            var menu = this.menuStack.last()
            var menuHeight = menu.y2 - menu.y1

            var width = game.width / 2
            var height = UI.font.height * 9 + menuHeight

            var cx = game.width / 2
            var cy = game.height / 2
            var x1 = cx - width / 2
            var y1 = cy - height / 2
            var x2 = cx + width / 2
            var y2 = cy + height / 2

            menu.y1 = y1 + UI.font.height * 9
            menu.y2 = menu.y1 + menuHeight

            this.width = width
            this.height = height
            this.cx = cx
            this.cy = cy
            this.x1 = x1
            this.y1 = y1
            this.x2 = x2
            this.y2 = y2
        }

        dismiss() {
            game.popWorld()
            this.winCombatWorld.onLevelUpWorldDismissed()
        }

        draw() {
            this.winCombatWorld.draw()
            var width = this.width
            var height = this.height
            var cx = this.cx
            var cy = this.cy
            var x1 = this.x1
            var y1 = this.y1
            var x2 = this.x2
            var y2 = this.y2
            var character = this.character

            // background
            UI.drawBox(new Rect(x1, y1, x2, y2), UI.whiteBorder)

            var y = y1

            // title
            UI.drawBox(new Rect(x1, y1, x2, y1 + UI.font.height), UI.floaterBorderRed)
            crackle.drawString(UI.font, 'Level Up ' + character.data.name + '!', cx, y, { align: crackle.Align.center, verticalAlign: crackle.VerticalAlign.top })
            y += UI.font.height + 16

            // xp
            crackle.setColor(0, 0, 0, 1)
            crackle.drawString(UI.font, 'XP: ' + character.xp, x1, y, { align: crackle.Align.left, verticalAlign: crackle.VerticalAlign.top })
            y += UI.font.height
            crackle.drawString(UI.font, 'Level: ' + character.level, x1, y, { align: crackle.Align.left, verticalAlign: crackle.VerticalAlign.top })
            y += UI.font.height
            crackle.drawString(UI.font, 'Max Votes: ' + character.maxVotes, x1, y, { align: crackle.Align.left, verticalAlign: crackle.VerticalAlign.top })
            y += UI.font.height
            crackle.drawString(UI.font, 'Max Spin: ' + character.maxSpin, x1, y, { align: crackle.Align.left, verticalAlign: crackle.VerticalAlign.top })
            y += UI.font.height * 2
            crackle.drawString(UI.font, 'Skill points to assign: ' + this.skillPoints, x1, y, { align: crackle.Align.left, verticalAlign: crackle.VerticalAlign.top })
            y += UI.font.height
            crackle.setColor(1, 1, 1, 1)

            this.drawMenu()
        }
    }


} 