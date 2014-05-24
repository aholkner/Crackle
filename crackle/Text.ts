module crackle {

    export enum Align {
        left,
        center,
        right
    }

    export enum VerticalAlign {
        top,
        center,
        baseline,
        bottom
    }

    export enum Overflow {
        none,
        wrap,
        wrapCharacters
    }

    export interface TextLayoutParameters {
        width?: number
        height?: number
        align?: Align
        verticalAlign?: VerticalAlign
        overflow?: Overflow
    }

    export interface TextRunStyle {
        font: Font
        color?: Color
        backgroundColor?: Color
    }

    export class TextRun {
        advance: number

        constructor(public style: TextRunStyle, public text: string) {
            this.advance = style.font.measureString(text)
        }
    }

    export class TextLine {
        contentWidth: number
        ascent: number
        descent: number
        x: number
        y: number

        constructor(public runs: TextRun[], contentWidth?: number) {
            if (contentWidth == null)
                contentWidth = runs.reduce((a: number, b) => a + b.advance, 0)
            this.contentWidth = contentWidth
            this.ascent = runs.reduce((a: number, b) => Math.min(a, b.style.font.ascent), 0)
            this.descent = runs.reduce((a: number, b) => Math.max(a, b.style.font.descent), 0)
            this.x = 0
            this.y = 0
        }
    }

    export class TextLayout {
        private _runs: TextRun[]
        private _x: number
        private _y: number
        private _width: number = NaN
        private _height: number = NaN
        private _align: Align = Align.left
        private _verticalAlign: VerticalAlign = VerticalAlign.baseline
        private _overflow: Overflow = Overflow.wrap
        private _dirty: boolean = true

        private _contentWidth: number = NaN
        private _contentHeight: number = NaN
        private _lines: TextLine[]

        constructor(runs: TextRun[], x: number, y: number, params?: TextLayoutParameters) {
            this._runs = runs
            this._x = x
            this._y = y
            if (params != null) {
                this._width = params.width || NaN
                this._height = params.height || NaN
                this._align = params.align || Align.left
                this._verticalAlign = params.verticalAlign || VerticalAlign.baseline
                this._overflow = params.overflow || Overflow.wrap
            }
        }

        get runs(): TextRun[] { return this._runs }
        set runs(runs: TextRun[]) {
            this._runs = runs
            this._dirty = true
        }

        get x(): number { return this._x }
        set x(x: number) {
            this._x = x
            this._dirty = true
        }

        get y(): number { return this._y }
        set y(y: number) {
            this._y = y
            this._dirty = true
        }

        get width(): number { return this._width }
        set width(width: number) {
            this._width = width
            this._dirty = true
        }

        get height(): number { return this._height }
        set height(height: number) {
            this._height = height
            this._dirty = true
        }

        get align(): Align { return this._align }
        set align(align: Align) {
            this._align = align
            this._dirty = true
        }

        get verticalAlign(): VerticalAlign { return this._verticalAlign }
        set verticalAlign(verticalAlign: VerticalAlign) {
            this._verticalAlign = verticalAlign
            this._dirty = true
        }

        get overflow(): Overflow { return this._overflow }
        set overflow(overflow: Overflow) {
            this._overflow = overflow
            this._dirty = true
        }

        get lines(): TextLine[] {
            if (this._dirty)
                this.update()
            return this._lines
        }

        get contentWidth(): number {
            if (this._dirty)
                this.update()
            return this._contentWidth
        }

        get contentHeight(): number {
            if (this._dirty)
                this.update()
            return this._contentHeight
        }

        private update() {
            this._dirty = false

            var contentWidth = this._runs.reduce((a: number, b) => a + b.advance, 0)
            if (isNaN(this._width) ||
                this._overflow == Overflow.none ||
                contentWidth <= this._width) {
                this._lines = [new TextLine(this._runs, contentWidth)]
            } else {
                this.updateOverflow()
            }

            this._contentWidth = this._lines.reduce((a: number, b) => Math.max(a, b.contentWidth), 0)
            this._contentHeight = this._lines.reduce((a: number, b) => a + b.descent - b.ascent, 0)
            this.updateLinePosition()
        }

        private updateOverflow() {
            var remainingRuns: TextRun[] = this._runs.slice(0)
            var lineRuns: TextRun[] = []
            var lines: TextLine[] = []
            var x = 0
            while (remainingRuns.length > 0) {
                var run = remainingRuns.shift()
                lineRuns.push(run)
                x += run.advance
                if (x > this._width) {
                    if (this._overflow == Overflow.wrap)
                        this.breakRunsWord(x, lineRuns, remainingRuns)
                    else if (this._overflow == Overflow.wrapCharacters)
                        this.breakRunsCharacter(x, lineRuns, remainingRuns)

                    if (lineRuns.length > 0) {
                        lines.push(new TextLine(lineRuns))
                        lineRuns = []
                        x = 0
                    }
                }
            }

            if (lineRuns.length > 0)
                lines.push(new TextLine(lineRuns))

            this._lines = lines
        }

        private breakRunsWord(x: number, lineRuns: TextRun[], remainingRuns: TextRun[]) {
            // Scan backwards through each glyph in lineRuns until suitable break
            // is found.  Push remaining glyphs into remainingRuns
            var startX = x
            var width = this._width
            for (var runIndex = lineRuns.length - 1; runIndex >= 0; --runIndex) {
                var run = lineRuns[runIndex]
                var text = run.text
                for (var i = text.length - 1; i >= 0; --i) {
                    x -= run.style.font.measureString(text[i])
                    if (x >= width)
                        continue

                    if (text[i] == ' ' || text[i] == '\u200B') {
                        if (runIndex != 0 || i != 0)
                            return this.breakRun(lineRuns, remainingRuns, runIndex, i, i + 1)
                    }
                }
            }

            // No breaks found.Repeat scan, break on character
            this.breakRunsCharacter(startX, lineRuns, remainingRuns)
        }

        private breakRunsCharacter(x: number, lineRuns: TextRun[], remainingRuns: TextRun[]) {
            // Scan backwards through each glyph in lineRuns until suitable break
            // is found.  Push remaining glyphs into remainingRuns
            var width = this._width
            for (var runIndex = lineRuns.length - 1; runIndex >= 0; --runIndex) {
                var run = lineRuns[runIndex]
                var text = run.text
                for (var i = text.length - 1; i >= 0; --i) {
                    x -= run.style.font.measureString(text[i])
                    if (x >= width)
                        continue

                    // Force a break on one glyph if we couldn't break at all
                    if (runIndex == i)
                        i += 1
                    return this.breakRun(lineRuns, remainingRuns, runIndex, i, i)
                }
            }
        }

        private breakRun(lineRuns: TextRun[], remainingRuns: TextRun[], runIndex: number, endGlyphIndex: number, startGlyphIndex: number) {
            var splitRun = lineRuns[runIndex]

            // Move entire runs to the right of runIndex into remaining_runs
            for (var i = lineRuns.length - 1; runIndex > runIndex; --runIndex) {
                remainingRuns.unshift(lineRuns[i])
            }
            lineRuns.splice(runIndex + 1)

            // lineRuns gets glyphs up to endGlyph_i of splitRun
            lineRuns[lineRuns.length - 1] = new TextRun(splitRun.style, splitRun.text.slice(0, endGlyphIndex))

            // remainingRuns gets the right side of startGlyphIndex
            remainingRuns.unshift(new TextRun(splitRun.style, splitRun.text.slice(startGlyphIndex)))
        }

        private updateLinePosition() {
            if (this._lines.length == 0)
                return

            var x = this._x
            var y = this._y
            var width = this._width
            var height = this._height
            var align = this._align
            var verticalAlign = this._verticalAlign

            if (!isNaN(width)) {
                // Align relative to box, not pivot
                if (align == Align.center)
                    x += width / 2
                else if (align == Align.right)
                    x += width
            }

            if (!isNaN(height)) {
                // Align relative to box, not pivot
                if (verticalAlign == VerticalAlign.center)
                    y += height / 2
                else if (verticalAlign == VerticalAlign.bottom)
                    y += height
                else if (verticalAlign == VerticalAlign.baseline)
                    verticalAlign = VerticalAlign.top
            }

            // Align first baseline vertically against pivot
            var line = this._lines[0]
            if (verticalAlign == VerticalAlign.center)
                y -= this._contentHeight / 2
            else if (verticalAlign == VerticalAlign.bottom)
                y -= this._contentHeight + line.descent
            else if (verticalAlign == VerticalAlign.baseline)
                y += line.ascent

            // Layout lines
            var startX = Math.floor(x)
            var y = Math.floor(y)
            for (var i = 0; i < this._lines.length; ++i) {
                var line = this._lines[i]
                x = startX
                if (align == Align.center)
                    x -= Math.floor(line.contentWidth / 2)
                else if (align == Align.right)
                    x -= line.contentWidth

                y -= line.ascent

                line.x = x
                line.y = y

                y += line.descent
            }
        }
    }

} 