/// <reference path="_References.ts" />

module gmp {

    export class MenuItem {
        constructor(public name: string, public description: string, public func?: { () }, public enabled?: boolean) {
            if (this.enabled == null)
                this.enabled = true
        }
    }

    export class Menu {
        maxItems: number = 6
        title: string
        align: crackle.Align = crackle.Align.center
        verticalAlign: crackle.VerticalAlign = crackle.VerticalAlign.center
        x: number = game.width / 2
        y: number = game.height / 2
        minWidth: number = 200

        enableInfo: boolean = true
        enableBorder: boolean = true
        canDismiss: boolean = true

        items: MenuItem[] = []
        selectedIndex: number = 0
        scrollOffset: number = 0
        scrollable: boolean
        
        width: number
        height: number
        x1: number
        y1: number
        x2: number
        y2: number

        constructor(public world: World) {
        }

        get selectedItem(): MenuItem {
            return this.items[this.selectedIndex]
        }

        get visibleItemCount(): number {
            return Math.min(this.maxItems, this.items.length)
        }

        get visibleItems(): MenuItem[]{
            return this.items.slice(this.scrollOffset, this.visibleItemCount)
        }

        layout() {
            this.width = 0
            this.scrollable = this.items.length > this.maxItems
            this.selectedIndex = 0

            var height: number = this.visibleItemCount * UI.font.height
            var width: number = this.visibleItems.max((item) => UI.font.measureString(item.name))

            if (this.title != null) {
                height += UI.font.height * 2
                width = Math.max(width, UI.font.measureString(this.title))
            }
        
            if (this.scrollable)
                height += 64

            var x1
            if (this.align == crackle.Align.left)
                x1 = this.x
            else if (this.align == crackle.Align.center)
                x1 = this.x - width / 2

            var y1
            if (this.verticalAlign == crackle.VerticalAlign.top)
                y1 = this.y
            else if (this.verticalAlign == crackle.VerticalAlign.center)
                y1 = this.y - height / 2
            else if (this.verticalAlign == crackle.VerticalAlign.bottom)
                y1 = this.y - height

            this.x1 = x1
            this.y1 = y1
            this.x2 = x1 + width
            this.y2 = y1 + height
        }

        onKeyPressed(key: crackle.Key) {
            if (key == crackle.Key.up)
                this.moveSelection(-1)
            else if (key == crackle.Key.down)
                this.moveSelection(1)
            else if (key == crackle.Key.left || key == crackle.Key.esc) {
                if (this.canDismiss)
                    this.world.popMenu()
            } else if (key == crackle.Key.right || key == crackle.Key.enter) {
                if (this.selectedItem.enabled && this.selectedItem.func != null)
                    this.selectedItem.func()
            }
        }

        moveSelection(dir: number) {
            var start = Math.max(0, this.selectedIndex)
            this.selectedIndex = Math.mod((this.selectedIndex + dir), this.items.length)
            if (this.selectedIndex < this.scrollOffset)
                this.scrollOffset = this.selectedIndex
            else if (this.selectedIndex >= this.scrollOffset + this.maxItems)
                this.scrollOffset = this.selectedIndex - this.maxItems + 1
        }

        draw() {
            var x1: number = this.x1
            var y1: number = this.y1
            var x2: number = this.x2
            var y2: number = this.y2
            var align: crackle.Align = this.align
        
            var x: number
            if (align == crackle.Align.left)
                x = this.x1
            else if (align == crackle.Align.center)
                x = (this.x1 + this.x2) / 2

            if (this.enableBorder)
                UI.drawBox(new Rect(x1, y1, x2, y2), UI.menuBorder)

            var y: number = y1
            if (this.title != null) {
                crackle.drawString(UI.font, this.title, x, y, { align: align, verticalAlign: crackle.VerticalAlign.top })
                y += UI.font.height * 2
            }

            if (this.scrollable) {
                UI.drawImage(UI.menuUpImage, (x1 + x2) / 2 - 16, y)
                y += 32
            }

            var infoY = y2
            var visibleItems = this.visibleItems
            for (var i = 0; i < visibleItems.length; ++i) {
                var item = visibleItems[i]
                if (i == this.selectedIndex + this.scrollOffset)
                    infoY = y

                this.activateMenuItemColor(i == this.selectedIndex + this.scrollOffset, item.enabled)
                crackle.drawString(UI.font, item.name, x, y, { align: align, verticalAlign: crackle.VerticalAlign.top })
                y += UI.font.height
            }

            crackle.setColor(1, 1, 1, 1)
            if (this.scrollable) {
                UI.drawImage(UI.menuDownImage, (x1 + x2) / 2 - 16, y)
                y += 32
            }

            if (this.enableInfo)
                this.drawStatus(this.selectedItem.description, x2, infoY)
        }

        drawStatus(msg: string, x: number, y: number) {
            if (this.enableInfo && this.world.menuStack.last() == this && game.world == this.world)
                UI.drawInfoBox(msg, x + 20, y - 4)
        }

        activateMenuItemColor(selected: boolean, enabled: boolean) {
            var m = enabled ? 1 : 0.5
            if (selected)
                crackle.setColor(m, m, m, 1)
            else
                crackle.setColor(m * 164 / 255, m * 186 / 255, m * 201 / 255, 1)
        }

    }

} 