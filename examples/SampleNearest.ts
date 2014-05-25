/// <reference path="../crackle/Game.ts" />

module Examples.SampleNearest {

    export class Game extends crackle.Game {
        static linearImage: crackle.Image;
        static nearestImage: crackle.Image;

        public onLoad() {
            Game.linearImage = new crackle.Image('examples/res/ball.png')
            Game.nearestImage = new crackle.Image('examples/res/ball.png', { sampleNearest: true })
        }

        public onTick() {
            crackle.clear(0, 0, 0, 255)
            crackle.setColor(1, 1, 1, 1)
            crackle.drawImageRegion(Game.linearImage, 0, 0, this.width / 2, this.height,
                0, 0, 16, 16)
            crackle.drawImageRegion(Game.nearestImage, this.width / 2, 0, this.width, this.height,
                16, 0, 32, 16)
        }
    }
}
