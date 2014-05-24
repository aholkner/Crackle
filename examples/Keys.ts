module Examples.Keys {

    export class Game extends crackle.Game {

        public onTick() {
            crackle.clear(0, 0, 0, 1)
            crackle.setColor(1, 1, 1, 1)

            var msg = 'Keys:'
            for (var key in crackle.keys) {
                msg += ' ' + crackle.Key[key]
            }
            crackle.drawString(null, msg, this.width / 2, this.height / 2, { align: crackle.Align.center, verticalAlign: crackle.VerticalAlign.center })
        }
    }
}
