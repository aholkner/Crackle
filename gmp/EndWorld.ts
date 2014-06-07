/// <reference path="_References.ts" />

module gmp {

    export class EndWorld extends World {
        y: number

        constructor(mapId: string) {
            super(mapId)
            game.playMusic('gmp/res/wwing2.mp3')
        }

        private out(text: string) {
            crackle.drawString(UI.font, text, 16, this.y);
            this.y += UI.font.height
        }

        draw() {
            crackle.drawImage(Resources.endImage, 0, 0, game.width, game.height)
            crackle.setColor(0, 0, 0, 1)

            this.y = 16 - UI.font.ascent

            this.out('Goodnight, Mr President')
            this.out('')
            this.out('A game for PyWeek #18 by Amanda Schofield and Alex Holkner')

            this.y = game.height - 11 * UI.font.height
            this.out('04b-03.ttf')
            this.out('Yuji Oshimoto')
            this.out('http://dsg4.com/04/extra/bitmap/')
            this.out('')
            this.out('The West Wing Theme Song')
            this.out('Nick Maynard')
            this.out('http://nickmaynard.tumblr.com/post/28877574787/attention-all-fans-of-the-west-wing-and-chiptune')
            this.out('')
            this.out('Crackle Game Engine')
            this.out('https://github.com/aholkner/crackle')

            crackle.setColor(1, 1, 1, 1)
            this.drawDialog()
        }

        onWorldKeyPressed(key: crackle.Key) {
            if (key == crackle.Key.esc) {
                // TODO crackle.quit()
            }
        }
    }
}