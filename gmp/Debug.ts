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
            this.items.push(new CheatToggleMenuItem('disableCollision'))
            this.items.push(new CheatToggleMenuItem('disableRequire'))
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