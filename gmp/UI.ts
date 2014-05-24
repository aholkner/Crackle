module gmp {

    export class Rect {
        constructor(public x1: number, public y1: number, public x2: number, public y2: number) {
        }
    }

    export class UI {

        static ts: number = 4
        static scale: number= 4
        static font: crackle.Font
        static image: crackle.Image

        static statBorder: crackle.Image[]
        static statBorderDisabled: crackle.Image[]
        static statBorderActive: crackle.Image[]
        
        static speechBorder: crackle.Image[]
        static speechPoint: crackle.Image

        static whiteBorder: crackle.Image[]
        static menuBorder: crackle.Image[]

        static menuUpImage: crackle.Image
        static menuDownImage: crackle.Image
        static combatSelectedArrow: crackle.Image
        static combatTargetArrow: crackle.Image

        static floaterBorderRed: crackle.Image[]
        static floaterBorderGreen: crackle.Image[]
        static floaterBorderGrey: crackle.Image[]
        static attackBorder: crackle.Image[]
        static infoBorder: crackle.Image[]

        static infoArrow: crackle.Image

        static healthBackgroundImage: crackle.Image
        static healthImage: crackle.Image

        static load() {
            UI.font = new crackle.Font('tinyfont', 12)
            UI.image = Resources.loadImage('ui.png')
            UI.statBorder = UI.getBorderTiles(0)
            UI.statBorderDisabled = UI.getBorderTiles(3)
            UI.statBorderActive = UI.getBorderTiles(6)
            UI.speechBorder = UI.getBorderTiles(9)
            UI.whiteBorder = UI.getBorderTiles(48)
            UI.menuBorder = UI.getBorderTiles(51)
            UI.speechPoint = UI.getTile2x(6)
            UI.menuUpImage = UI.getTile2x(19)
            UI.menuDownImage = UI.getTile2x(20)
            UI.combatSelectedArrow = UI.getTile2x(7)
            UI.combatTargetArrow = UI.getTile2x(14)
            UI.floaterBorderRed = UI.getBorderTiles(96)
            UI.floaterBorderGreen = UI.getBorderTiles(99)
            UI.floaterBorderGrey = UI.getBorderTiles(102)
            UI.attackBorder = UI.getBorderTiles(105)
            UI.infoBorder = UI.getBorderTiles(108)
            UI.infoArrow = UI.getTile2x(15)
            UI.healthBackgroundImage = UI.getTile(58)
            UI.healthImage = UI.getTile(59)
        }

        static getBorderTiles(n: number): crackle.Image[]{
            return [
                UI.getTile(n + 0),
                UI.getTile(n + 1),
                UI.getTile(n + 2),
                UI.getTile(n + 16),
                UI.getTile(n + 17),
                UI.getTile(n + 18),
                UI.getTile(n + 32),
                UI.getTile(n + 33),
                UI.getTile(n + 34),
            ]
        }

        static getTile(i: number): crackle.Image {
            var ts = UI.ts
            var x = i % 16
            var y = Math.floor(i / 16)
            return UI.image.getRegion(x * ts, y * ts, (x + 1) * ts, (y + 1) * ts)
        }

        static getTile2x(i: number): crackle.Image {
            var ts = UI.ts * 2
            var x = i % 8
            var y = Math.floor(i / 8)
            return UI.image.getRegion(x * ts, y * ts, (x + 1) * ts, (y + 1) * ts)
        }

        static drawBox(rect: Rect, borderTiles?: crackle.Image[]) {
            // 0 1 2
            // 3 4 5
            // 6 7 8

            if (borderTiles == null)
                borderTiles = UI.whiteBorder
            var ts = UI.ts

            crackle.pushTransform()
            crackle.scale(UI.scale, UI.scale)
            var x1 = rect.x1 / UI.scale
            var y1 = rect.y1 / UI.scale
            var x2 = rect.x2 / UI.scale
            var y2 = rect.y2 / UI.scale

            // corners
            crackle.drawImage(borderTiles[0], x1 - ts, y1 - ts)
            crackle.drawImage(borderTiles[2], x2, y1 - ts)
            crackle.drawImage(borderTiles[6], x1 - ts, y2)
            crackle.drawImage(borderTiles[8], x2, y2)

            // top / bottom
            crackle.drawImage(borderTiles[1], x1, y1 - ts, x2, y1)
            crackle.drawImage(borderTiles[7], x1, y2, x2, y2 + ts)

            // left / right
            crackle.drawImage(borderTiles[3], x1 - ts, y1, x1, y2)
            crackle.drawImage(borderTiles[5], x2, y1, x2 + ts, y2)

            // fill
            crackle.drawImage(borderTiles[4], x1, y1, x2, y2)

            crackle.popTransform()
        }

        static drawImage(image: crackle.Image, x: number, y: number) {
            crackle.drawImage(image, x, y, x + image.width * UI.scale, y + image.height * UI.scale)
        }

        static drawSpeechBox(text, speakerX, speakerY) {
            var width = Math.min(UI.font.measureString(text), game.width / 2)
            var x1 = Math.max(0, Math.min(speakerX, game.width - width - 16))
            var x2 = x1 + width
            var y2 = speakerY - 28

            var run = new crackle.TextRun({ font: UI.font }, text)
            var textLayout = new crackle.TextLayout([run], x1, y2, { width: width, align: crackle.Align.left, verticalAlign: crackle.VerticalAlign.bottom })
            if (textLayout.contentWidth < 48)
                textLayout = new crackle.TextLayout([run], x1, y2, { width: 48, align: crackle.Align.center, verticalAlign: crackle.VerticalAlign.bottom })
            var y1 = y2 - textLayout.contentHeight - 8 // hack workaround
            x2 = x1 + Math.max(textLayout.contentWidth, 48)

            UI.drawBox(new Rect(x1, y1, x2, y2), UI.speechBorder)
            UI.drawImage(UI.speechPoint, speakerX + 16, y2)

            crackle.setColor(0, 0, 0, 1)
            crackle.drawTextLayout(textLayout)
            crackle.setColor(1, 1, 1, 1)
        }

        static drawInfoBox(text: string, speakerX: number, speakerY: number) {
            var width = Math.min(UI.font.measureString(text), 250, game.width - speakerX - 16)
            var x1 = speakerX
            var x2 = x1 + width
            var y1 = speakerY

            var run = new crackle.TextRun({ font: UI.font }, text)
            var textLayout = new crackle.TextLayout([run], x1, y1, { width: width, align: crackle.Align.left, verticalAlign: crackle.VerticalAlign.top })
            if (y1 + textLayout.contentHeight > game.height - 116)
                textLayout.y = y1 = game.height - 116 - textLayout.contentHeight
            var y2 = y1 + textLayout.contentHeight
            x2 = x1 + textLayout.contentWidth

            UI.drawBox(new Rect(x1, y1, x2, y2), UI.infoBorder)
            UI.drawImage(UI.infoArrow, x1 - 32, speakerY)
            crackle.drawTextLayout(textLayout)
        }

        static drawMessageBox(text: string) {
            var width = Math.min(UI.font.measureString(text), game.width / 3)
            var cx = game.width / 2
            var cy = game.height / 2 - 32

            var run = new crackle.TextRun({ font: UI.font }, text)
            var textLayout = new crackle.TextLayout([run], cx - width / 2, cy, { width: width, align: crackle.Align.center, verticalAlign: crackle.VerticalAlign.center })
            var y1 = cy - textLayout.contentHeight / 2
            var y2 = cy + textLayout.contentHeight / 2
            var x1 = cx - textLayout.contentWidth / 2
            var x2 = cx + textLayout.contentWidth / 2

            UI.drawBox(new Rect(x1, y1, x2, y2))

            crackle.setColor(0, 0, 0, 1)
            crackle.drawTextLayout(textLayout)
            crackle.setColor(1, 1, 1, 1)
        }

        static drawTextBox(text, x, y, borderTiles) {
            var width = UI.font.measureString(text) + 8
            var x1 = x - width / 2
            var y1 = y - UI.font.height
            var x2 = x + width / 2
            var y2 = y
            UI.drawBox(new Rect(x1, y1, x2, y2), borderTiles)
            crackle.drawString(UI.font, text, x1 + 4, y1, { verticalAlign: crackle.VerticalAlign.top })
        }

        static drawCombatSelectionBox(text, x, y) {
            var width = UI.font.measureString(text) + 8
            var x1 = x - width / 2
            var y1 = y - UI.font.height / 2
            var x2 = x1 + width
            var y2 = y + UI.font.height
            UI.drawBox(new Rect(x1, y1, x2, y2), UI.statBorderActive)
            UI.drawImage(UI.combatSelectedArrow, x - 8, y1 - 16)
            crackle.drawString(UI.font, text, x1 + 4, y1 + 4, { verticalAlign: crackle.VerticalAlign.top })
        }

    }

} 