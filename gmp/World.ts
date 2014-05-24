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

        draw() {
            this.drawWorld()
            this.drawMenu()
            this.drawHud()
            this.drawStats()
        }

        drawWorld() {
            // TODO
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

        after(timeout: number, func: { () }) {
            this.timeouts.push(new Timeout(timeout, func))
        }

        onWorldKeyPressed(key: crackle.Key) {
        }

        onKeyPressed(key: crackle.Key) {
            if (this.menuStack.length > 0) {
                this.menuStack[this.menuStack.length - 1].onKeyPressed(key)
            }

            this.onWorldKeyPressed(key)
        }

        onKeyReleased(key: crackle.Key) {
        }
    }

}