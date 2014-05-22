var ballImage: crackle.Image;

class Ball {
    static width: number
    static height: number
    x: number
    y: number
    dx: number
    dy: number

    constructor() {
        this.x = Math.random() * game.width - Ball.width
    	this.y = Math.random() * game.height - Ball.height

    	this.dx = (Math.random() - 0.5) * 1000
        this.dy = (Math.random() - 0.5) * 1000
    }

    update(dt) {
        if (this.x <= 0 || this.x + Ball.width >= game.width) {
            this.dx *= -1
            this.onBounce()
        }
        if (this.y <= 0 || this.y + Ball.height >= game.height) {
            this.dy *= -1
            this.onBounce()
        }
        this.x += this.dx * dt
        this.y += this.dy * dt

        this.x = Math.min(Math.max(this.x, 0), game.width - Ball.width)
        this.y = Math.min(Math.max(this.y, 0), game.height - Ball.height)
    }
    
    onBounce() {
        //pan = self.x / float(crackle.window.width - self.width) * 2 - 1
        //pitch = 0.9 + random.random() * 0.2
        //ball_sound.play(gain=0.1, pan=pan, pitch=pitch)
    }
}

var balls = new Array();

class Game extends crackle.Game {
    public onLoad() {
        ballImage = new crackle.Image('examples/res/ball.png')
    }

    public onInit() {
        Ball.width = ballImage.width
        Ball.height = ballImage.height
        for (var i = 0; i < 100; ++i)
            balls.push(new Ball())
    }

    public onTick() {
        crackle.clear(0, 0, 0, 255)
        crackle.setColor(1, 1, 1, 1)
        for (var i = 0; i < balls.length; ++i) {
        	var ball = balls[i];
        	ball.update(crackle.timestep)
        	crackle.drawImage(ballImage, ball.x, ball.y)
        }
    }
}

var game: Game;
//window.onload = () => {
//    var el = document.getElementById('content');
//    game = new Game(el);
//    game.run();
//};