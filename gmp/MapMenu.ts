/// <reference path="_References.ts" />
module gmp {

    export class MapMenu extends Menu {

        constructor(world: World) {
            super(world)

            var enableInventory = game.questItems.length > 0 || game.player.itemAttacks.length > 0

            this.title = 'Paused'
            this.items.push(new MenuItem('Resume', 'Back to the game', () => { this.onResume() }))
            this.items.push(new MenuItem('Inventory', 'Check your briefcase', () => { this.onInventory() }, enableInventory))
            this.items.push(new MenuItem('Quit', 'Exit the game', () => { this.onQuit() }))
        }

        onResume() {
            this.world.popMenu()
        }

        onInventory() {
            this.world.popMenu()
            this.world.pushMenu(new InventoryMenu(this.world))
        }

        onQuit() {
            // TODO 
        }
    }

    class InventoryMenu extends Menu {
        constructor(world: World) {
            super(world)
            this.title = 'Inventory'
            for (var i = 0; i < game.player.itemAttacks.length; ++i) {
                var ia = game.player.itemAttacks[i]
                var name = ia.attack.name
                if (ia.quantity > 1)
                    name = name + '(x' + ia.quantity + ')'
                var func = null
                for (var j = 0; j < ia.attack.effects.length; ++j) {
                    var effect = ia.attack.effects[j]
                    if (effect.func == 'add_permanent')
                        func = () => { this.onConsume(ia) }
                }
                if (func)
                    name += ' >'
                this.items.push(new MenuItem(name, ia.attack.description, func, func != null))
            }

            for (var i = 0; i < game.questItems.length; ++i) {
                var item = game.questItems[i]
                this.items.push(new MenuItem(item.name, item.description, null))
            }
        }

        onConsume(ia: ItemAttack) {
            this.world.pushMenu(new InventoryConsumeMenu(this.world, ia))
        }
    }

    class InventoryConsumeMenu extends Menu {
        constructor(world: World, ia: ItemAttack) {
            super(world)
            for (var i = 0; i < game.allies.length; ++i) {
                var ally = game.allies[i]
                this.items.push(new MenuItem(ally.data.name, 'apply ' + ia.attack.name + ' to ' + ally.data.name, () => { this.onConsume(ia, ally) }))
            }
        }

        onConsume(ia: ItemAttack, ally: Character) {
            for (var i = 0; i < ia.attack.effects.length; ++i) {
                var effect = ia.attack.effects[i]
                if (effect.func == 'add_permanent')
                    new ActiveEffect(effect, 1).apply(ally)
            }
            ItemAttack.removeAttackFromItemAttackList(ally.itemAttacks, ia.attack)
            this.world.popAllMenus()
        }
    }

    export class ShopMenu extends Menu {
        constructor(world: World, shopId: string) {
            super(world)
            var wares = gameData.shops[shopId]
            for (var i = 0; i < wares.length; ++i) {
                var ware = wares[i]
                var name = ware.itemAttack.name + ' ($' + ware.price + ')'
                var item = new MenuItem(name, '', () => { this.onPurchase(ware) });
                (<any>item).ware = ware
                this.items.push(item)
            }
            this.items.push(new MenuItem('Done', 'Leave store', () => { this.onDone() }))
            this.updateItems()
        }

        updateItems() {
            for (var i = 0; i < this.items.length; ++i) {
                var item = this.items[i]
                if ('ware' in item) {
                    var count = 0
                    var ware = (<any>item).ware
                    for (var j = 0; j < game.player.itemAttacks.length; ++j) {
                        var ia = game.player.itemAttacks[j]
                        if (ia.attack == ware.itemAttack)
                            count = ia.quantity
                    }
                    item.description = ware.itemAttack.description + '(you currently have ' + count + ' of these).'
                    item.enabled = ware.price <= game.money
                }
            }
        }

        onPurchase(ware: Shop) {
            game.money -= ware.price
            ItemAttack.addAttackToItemAttackList(game.player.itemAttacks, ware.itemAttack)
            this.updateItems()
        }

        onDone() {
            this.world.popMenu()
            this.world.onDismissDialog()
        }
    }
}