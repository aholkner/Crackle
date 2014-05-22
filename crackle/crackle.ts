module crackle {

    export function init() {
        if (renderer == null)
            renderer = new CanvasRenderer()
    }

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
