/// <reference path="../crackle/Game.ts" />

module Examples.KeyEvent {

    export class Game extends crackle.Game {

        msg: string = 'Press a key'

        public onTick() {
            crackle.clear(0, 0, 0, 1)
            crackle.setColor(1, 1, 1, 1)
            crackle.drawString(null, this.msg, this.width / 2, this.height / 2, { align: crackle.Align.center, verticalAlign: crackle.VerticalAlign.center })
        }

        public onKey(key: crackle.Key, pressed: boolean) {
            if (pressed)
                this.msg = 'Pressed ' + crackle.Key[key]
            else
                this.msg = 'Released ' + crackle.Key[key]
        }
    }
}
