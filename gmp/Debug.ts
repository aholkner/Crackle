/// <reference path="_References.ts" />

module gmp {

    class CheatToggleMenuItem extends MenuItem {
        flag: string

        constructor(name: string) {
            super(name, '', () => { this.toggle() })
            this.flag = name
            this.refreshName()
        }

        private toggle() {
            Debug[this.flag] = !Debug[this.flag]
            this.refreshName()
        }

        private refreshName() {
            var value: boolean = Debug[this.flag]
            this.name = this.flag + ': ' + (value ? 'YES' : 'NO')
        }
    }

    class CheatMenu extends Menu {
        constructor(world: World) {
            super(world)
            this.enableInfo = false
            this.items.push(new MenuItem('win encounter', '', () => this.winEncounter()))
            this.items.push(new MenuItem('add money', '', () => { game.money += 1000 }))
            this.items.push(new MenuItem('restore votes', '', () => { this.restoreVotes() }))
            this.items.push(new MenuItem('restore spin', '', () => { this.restoreSpin() }))
            this.items.push(new MenuItem('unlock attacks', '', () => { this.unlockAttacks() }))
            this.items.push(new CheatToggleMenuItem('disableCollision'))
            this.items.push(new CheatToggleMenuItem('disableRequire'))
        }

        private winEncounter() {
            if (game.world instanceof CombatWorld) {
                (<CombatWorld>game.world).win()
            }
        }

        private restoreVotes() {
            game.allies.forEach((ally) => {
                ally.votes = ally.maxVotes
            })
        }

        private restoreSpin() {
            game.allies.forEach((ally) => {
                ally.spin = ally.maxSpin
            })
        }

        private unlockAttacks() {
            game.allies.forEach((ally) => {
                for (var attackId in gameData.attacks) {
                    var attack = gameData.attacks[attackId]
                    if (ally.attacks.indexOf(attack) == -1)
                        ally.attacks.push(attack)
                }
            })
        }
    }

    export class Debug {

        static onKeyPressed(key: crackle.Key) {
            if (key == crackle.Key.c && document.location.hash.indexOf('debug') != -1)
                game.world.pushMenu(new CheatMenu(game.world))
        }

        static disableCollision: boolean
        static disableRequire: boolean
    }

}