module crackle {

    export function init() {
        args = parseArgs(document.location.search)
        if (renderer == null)
            renderer = new CanvasRenderer()
    }

    export var time: number = 0
    export var timestep: number = 0

    function getValueByPath(o: any, s: string) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, '');           // strip a leading dot
        var a = s.split('.');
        while (a.length) {
            var n = a.shift();
            if (n in o) {
                o = o[n];
            } else {
                return;
            }
        }
        return o;
    }

    export var args: { [arg: string]: string }

    function parseArgs(search: string): { [arg: string]: string } {
        var result: { [arg: string]: string } = {}
        if (search[0] == '?')
            search = search.substr(1)
        var kvPairs = search.split('&')
        for (var i = 0; i < kvPairs.length; ++i) {
            var kv = kvPairs[i]
            var eqIndex = kv.indexOf('=')
            var key: string
            var value: any
            if (eqIndex != -1) {
                key = kv.substr(0, eqIndex)
                value = kv.substr(eqIndex + 1)
            }
            else {
                key = kv
                value = true
            }
            result[key] = value
        }
        return result
    }

    // Automatically spawn games
    window.addEventListener('load', () => {
        var containers = document.getElementsByTagName('div')
        for (var i = 0; i < containers.length; ++i) {
            var container = containers[i]
            var gameClass: string = (<Element>container).getAttribute('data-crackle-game')
            if (gameClass != null) {
                var cls = getValueByPath(window, gameClass)
                var game = Object.create(cls.prototype)
                game.constructor.apply(game, new Array(container))
                game.run()
            }
        }

        
    })

}
