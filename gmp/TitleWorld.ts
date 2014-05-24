/// <reference path="_References.ts" />

module gmp {

    class TitleMenu extends Menu {
        constructor(world: World) {
            super(world)
            this.items.push(new MenuItem('New Game', '', () => this.onNewGame()))
            this.items.push(new MenuItem('Continue', '', () => this.onContinue(), false))
        }

        onNewGame() {
        }

        onContinue() {
        }
    }

    export class TitleWorld extends World {
        constructor(mapId: string) {
            super(mapId)
        }

        start() {
            this.after(2, () => this.showMenu())
        }

        showMenu() {
            if (this.menuStack.length == 0)
                this.pushMenu(new TitleMenu(this))
        }

        onKeyPressed(key: crackle.Key) {
            super.onKeyPressed(key)
            this.showMenu()
        }

        draw() {
            crackle.drawImage(Resources.titleImage, 0, 0, game.width, game.height)
            this.drawMenu()
        }
    }

}