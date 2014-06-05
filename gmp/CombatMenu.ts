/// <reference path="_References.ts" />
module gmp {

    export class CombatMenu extends Menu {
        minWidth: number = 96
        combatWorld: CombatWorld

        constructor(world: CombatWorld) {
            super(world)
            this.combatWorld = world
        }

        layout() {
            if (this.world.menuStack.length > 0)
                this.x = this.world.menuStack.last().x2
            else
                this.x = 16
            this.y = game.height - 116
            this.align = crackle.Align.left
            this.verticalAlign = crackle.VerticalAlign.bottom

            super.layout()
        }
    }

    export class CombatMenuMain extends CombatMenu {
        constructor(world: CombatWorld) {
            super(world)
            var character = this.world.currentCharacter

            //workaround for unknown bug
            world.popAllMenus()

            this.items.push(new MenuItem('Offense >', 'Launch a political attack', () => { this.onOffense() }))
            this.items.push(new MenuItem('Defense', gameData.attacks['DEFENSE'].description, () => { this.onDefense() }))
            this.items.push(new MenuItem('Spin >', 'Run spin to get control of the situation', () => { this.onSpin() }))
            this.items.push(new MenuItem('Items >', 'Use an item from your briefcase', () => { this.onItems() }, character.itemAttacks.length > 0))
            this.canDismiss = false
        }

        onOffense() {
            this.world.pushMenu(new CombatOffenseMenu(this.combatWorld, this.world.currentCharacter.attacks.filter((attack) => attack.spinCost == 0)))
        }

        onDefense() {
            this.combatWorld.actionAttack(gameData.attacks['DEFENSE'], [])
        }

        onSpin() {
            this.world.pushMenu(new CombatOffenseMenu(this.combatWorld, this.world.currentCharacter.attacks.filter((attack) => attack.spinCost > 0)))
        }

        onItems() {
            this.world.pushMenu(new CombatOffenseMenu(this.combatWorld, this.world.currentCharacter.itemAttacks))
        }
    }

    class CombatOffenseMenu extends CombatMenu {
        constructor(world: CombatWorld, attacks: any[]) {
            super(world)
            attacks.forEach((attack_: any) => {
                var quantity
                var attack
                if (attack_ instanceof ItemAttack) {
                    quantity = (<ItemAttack>attack_).quantity
                    attack = (<ItemAttack>attack_).attack
                }
                else {
                    quantity = 1
                    attack = <Attack>attack_
                }

                var name = attack.name
                var enabled = true

                if (attack.underlyingStat == 'money') {
                    name = name + ' ($' + world.encounter.bribeCost + ')'
                    enabled = enabled && game.money >= world.encounter.bribeCost
                }

                if (quantity > 1)
                    name = name + '(x' + quantity + ')'

                enabled = enabled && world.currentCharacter.spin >= attack.spinCost
                if (attack.targetType == 'DeadFriendly' && world.playerSlots.filter((slot) => slot.character && slot.character.dead).length == 0)
                    enabled = false

                var description = attack.description
                if (attack.spinCost)
                    description += ' (Uses ' + attack.spinCost + ' spin).'

                this.items.push(new MenuItem(name, description, () => { this.select(attack) }, enabled))
            })
        }

        select(attack: Attack) {
            if (attack.targetType == 'None')
                this.combatWorld.actionAttack(attack, [])
            else
                this.combatWorld.pushMenu(new CombatTargetMenu(this.combatWorld, attack.targetType, attack.targetCount, (targets) => { this.chooseTarget(attack, targets) }))
            }

        chooseTarget(attack: Attack, targets: Character[]) {
            this.combatWorld.actionAttack(attack, targets)
        }
    }

    class CombatTargetMenu extends CombatMenu {
        slots: Slot[]

        constructor(world: CombatWorld, public targetType: string, public targetCount: number, public func: { (targets: Character[]) }) {
            super(world)
            this.canDismiss = true
            this.enableInfo = false
            this.items = [new MenuItem('< choose target >', 'choose target')]

            if (targetType == 'AllEnemy')
                this.slots = world.monsterSlots.filter((slot) => slot.character && !slot.character.dead)
            else if (targetType == 'AllFriendly')
                this.slots = world.playerSlots.filter((slot) => slot.character && !slot.character.dead)
            else if (targetType == 'DeadFriendly')
                this.slots = world.playerSlots.filter((slot) => slot.character && slot.character.dead)
            else if (targetType == 'All')
                this.slots = world.slots.filter((slot) => slot.character && !slot.character.dead)
            else
                throw new AssertException('invalid targettype')

            this.slots.sort((a, b) => a.x - b.x)
            this.targetCount = Math.min(this.targetCount, this.slots.length)
        }

        get selectedSlots(): Slot[] {
            return this.slots.slice(this.selectedIndex, this.selectedIndex + this.targetCount)
        }

        onKeyPressed(key: crackle.Key) {
            if (key == crackle.Key.left)
                this.selectedIndex = Math.mod(this.selectedIndex - 1, this.slots.length - this.targetCount + 1)
            else if (key == crackle.Key.right)
                this.selectedIndex = Math.mod(this.selectedIndex + 1, this.slots.length - this.targetCount + 1)
            else if (key == crackle.Key.esc) {
                if (this.canDismiss)
                    this.world.popMenu()
            }
            else if (key == crackle.Key.enter) {
                this.func(this.selectedSlots.map((slot) => slot.character))
            }
        }

        draw() {
            for (var i = 0; i < this.targetCount; ++i) {
                var slot = this.slots[this.selectedIndex + i]
                var x = slot.x * this.world.tileSize * game.mapScale
                var y = slot.y * this.world.tileSize * game.mapScale
                UI.drawImage(UI.combatTargetArrow, x + 4, y - 32)
            }
            super.draw()
        }
    }
}