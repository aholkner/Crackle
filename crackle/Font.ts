﻿module crackle {
    
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
        height: number

        constructor(public name: string, public size: number) {
            this.specifier = size + 'pt "' + name + '"'
            ResourceQueue.current.loadFont(this)
        }

        onLoaded() {
            var cssMetrics = new CSSFontMetrics(this.specifier)
            this.ascent = cssMetrics.ascent
            this.descent = cssMetrics.descent
            this.height = this.descent - this.ascent
        }

        measureString(text: string) {
            return renderer.measureString(this, text)
        }

        // Create a hidden DOM node temporarily to measure a dummy string with the given
        // font family
        private static measureCSSFontWidth(fontFamily: string) {
            var div = document.createElement('div')
            div.style.visibility = 'hidden'
            div.style.fontFamily = fontFamily
            div.style.fontSize = '96pt'
            
            var span = document.createElement('span')
            span.appendChild(document.createTextNode('a test string.'))
            span.style.whiteSpace = 'nowrap'
            div.appendChild(span)

            var body = document.getElementsByTagName('body')[0]
            body.appendChild(div)

            var width = span.offsetWidth
            body.removeChild(div)
            return width
        }

        // Compare DOM render of this font compared to a fallback; returns true if the metrics are different
        // and therefore the font has loaded
        get isLoaded(): boolean {
            var name = this.name
            if (name.indexOf(' ') != -1)
                name = '"' + name + '"'
            return Font.measureCSSFontWidth(name + ',monospace') != Font.measureCSSFontWidth('monospace') ||
                Font.measureCSSFontWidth(name + ',serif') != Font.measureCSSFontWidth('serif')
        }
    }

} 