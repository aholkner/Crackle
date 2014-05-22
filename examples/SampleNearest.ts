
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
            crackle.drawImage(Game.linearImage, 0, 0, this.width / 2, this.height)
            crackle.drawImage(Game.nearestImage, this.width / 2, 0, this.width, this.height)
        }
    }
}

//window.onload = () => {
//    var el = document.getElementById('content');
//    var game = new Examples.SampleNearest.Game(el);
//    game.run();
//}; 