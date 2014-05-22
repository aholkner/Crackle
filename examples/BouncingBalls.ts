module Examples.BouncingBalls {

    class Ball {
        static image: crackle.Image
        static width: number
        static height: number
        x: number
        y: number
        dx: number
        dy: number

        constructor() {
            this.x = Math.random() * Game.instance.width - Ball.width
    	    this.y = Math.random() * Game.instance.height - Ball.height

    	    this.dx = (Math.random() - 0.5) * 1000
            this.dy = (Math.random() - 0.5) * 1000
        }

        update(dt) {
            if (this.x <= 0 || this.x + Ball.width >= Game.instance.width) {
                this.dx *= -1
                this.onBounce()
            }
            if (this.y <= 0 || this.y + Ball.height >= Game.instance.height) {
                this.dy *= -1
                this.onBounce()
            }
            this.x += this.dx * dt
            this.y += this.dy * dt

            this.x = Math.min(Math.max(this.x, 0), Game.instance.width - Ball.width)
            this.y = Math.min(Math.max(this.y, 0), Game.instance.height - Ball.height)
        }

        onBounce() {
            //pan = self.x / float(crackle.window.width - self.width) * 2 - 1
            //pitch = 0.9 + random.random() * 0.2
            //ball_sound.play(gain=0.1, pan=pan, pitch=pitch)
        }
    }

    export class Game extends crackle.Game {
        static instance: Game;

        balls;

        public onLoad() {
            Game.instance = this;
            Ball.image = new crackle.Image('examples/res/ball.png')
        }

        public onInit() {
            this.balls = new Array();
            Ball.width = Ball.image.width
            Ball.height = Ball.image.height
            for (var i = 0; i < 100; ++i)
                this.balls.push(new Ball())
        }

        public onTick() {
            crackle.clear(0, 0, 0, 255)
            crackle.setColor(1, 1, 1, 1)
            for (var i = 0; i < this.balls.length; ++i) {
                var ball = this.balls[i];
                ball.update(crackle.timestep)
        	    crackle.drawImage(Ball.image, ball.x, ball.y)
            }
        }
    }
}
//window.onload = () => {
//    var el = document.getElementById('content');
//    game = new Game(el);
//    game.run();
//};