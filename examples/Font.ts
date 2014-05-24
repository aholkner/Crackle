module Examples.Font {

    export class Game extends crackle.Game {
        font: crackle.Font

        public onLoad() {
            this.font = new crackle.Font('tinyfont', 24)
        }

        public onTick() {
            crackle.clear(0, 0, 0, 1)
            crackle.setColor(1, 1, 1, 1)
            crackle.drawString(this.font, 'Hello, Crackle!', 50, 50)
        }
    }
}
