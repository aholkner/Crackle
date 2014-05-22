module crackle {

    class CSSFontMetrics {
        ascent: number
        descent: number

        private createAlignmentImage(container: HTMLElement, verticalAlign: string): HTMLImageElement {
            var img = document.createElement('img')
            img.style.verticalAlign = verticalAlign
            img.width = 1
            img.height = 1
            container.appendChild(img)
            return img
        }

        constructor(fontSpecifier: string) {
            var div = document.createElement('div')
            div.style.visibility = 'hidden'
            div.style.font = fontSpecifier
            var topImage = this.createAlignmentImage(div, 'top')
            var baselineImage = this.createAlignmentImage(div, 'baseline')
            var bottomImage = this.createAlignmentImage(div, 'bottom')
            var body = document.getElementsByTagName('body')[0]
            body.appendChild(div)

            var topOffset = topImage.offsetTop
            var baselineOffset = baselineImage.offsetTop + baselineImage.offsetHeight
            var bottomOffset = bottomImage.offsetTop + bottomImage.offsetHeight
            body.removeChild(div)

            this.ascent = topOffset - baselineOffset
            this.descent = bottomOffset - baselineOffset
        }
    }

    export class Font {
        specifier: string
        ascent: number
        descent: number

        constructor(specifier: string) {
            this.specifier = specifier

            var cssMetrics = new CSSFontMetrics(specifier)
            this.ascent = cssMetrics.ascent
            this.descent = cssMetrics.descent
        }
    }

} 