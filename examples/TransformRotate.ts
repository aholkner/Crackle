/// <reference path="../crackle/Game.ts" />

module Examples.TransformRotate {

    export class Game extends crackle.Game {
        static kitten: crackle.Image;

        public onLoad() {
            Game.kitten = new crackle.Image('examples/res/kitten.png')
        }

        public onTick() {
            crackle.clear(0, 0, 0, 255)
            crackle.translate(Game.kitten.width / 2, Game.kitten.height / 2)
            crackle.rotate(Math.PI / 4)
            crackle.drawImage(Game.kitten, -Game.kitten.width / 2, -Game.kitten.height / 2)
        }
    }
}
