/// <reference path="../crackle/Game.ts" />

module Examples.ImageRegion2 {

    export class Game extends crackle.Game {
        static kitten: crackle.Image;
        static kitten2: crackle.Image;
        static kitten3: crackle.Image;

        public onLoad() {
            Game.kitten = new crackle.Image('examples/res/kitten.png')
        }

        public onInit() {
            Game.kitten2 = Game.kitten.getRegion(50, 256, Game.kitten.width - 50, Game.kitten.height - 10)
            Game.kitten3 = Game.kitten2.getRegion(50, 100, Game.kitten2.width - 50, Game.kitten2.height - 50)
        }

        public onTick() {
            crackle.clear(0, 0, 0, 255)
            if (crackle.time % 3 > 2)
                crackle.drawImage(Game.kitten, 0, 0)
            else if (crackle.time % 3 > 1)
                crackle.drawImage(Game.kitten2, 50, 256)
            else
                crackle.drawImage(Game.kitten3, 100, 356)
        }
    }
}
 