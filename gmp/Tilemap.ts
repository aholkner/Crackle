module gmp {

    interface TilemapObjectData {
        name:string
        gid?: number
        x: number
        y: number
        width: number
        height: number
        properties?: { [key: string]: any }
    }

    interface TilemapLayerData {
        name: string
        x: number
        y: number
        width: number
        height: number
        opacity: number
        type: string
        visible: boolean
        data?: number[]
        properties?: { [key: string]: any }
        objects?: TilemapObjectData[]
    }

    interface TilemapTilesetData {
        firstgid: number
        image: string
        imageheight: number
        imagewidth: number
        margin: number
        name: string
        properties?: { [key: string]: any }
        spacing: number
        tilewidth: number
        tileheight: number
        tileproperties: {
            [index: number]: { [key: string]: any }
        }
    }

    interface TilemapData {
        version: number
        width: number
        height: number
        orientation: string
        tilewidth: number
        tileheight: number
        properties?: { [key: string]: any }
        tilesets: TilemapTilesetData[]
        layers: TilemapLayerData[]
    }

    export class Tile {
        properties: { [key: string]: any }

        constructor(public image: crackle.Image) {
        }
    }

    export class Tileset {
        firstgid: number
        tiles: Tile[] = []
    }

    export class TilemapLayer {
        name: string
    }

    export class TilemapTileLayer extends TilemapLayer {
        tiles: Tile[] = []
    }

    export class TilemapObject {
        x: number
        y: number
        name: string
        tile: Tile
        properties: { [key: string]: any }
    }

    export class TilemapObjectLayer extends TilemapLayer {
        objects: TilemapObject[] = []
    }

    export class Tilemap {

        tileWidth: number
        tileHeight: number
        rows: number
        cols: number
        tilesets: Tileset[] = []
        layers: TilemapLayer[] = []

        constructor(jsonData: crackle.JsonData) {
            var data: TilemapData = jsonData.data
            var basePath = jsonData.src.slice(0, jsonData.src.lastIndexOf('/') + 1)

            this.tileWidth = data.tilewidth
            this.tileHeight = data.tileheight
            this.rows = data.height
            this.cols = data.width

            data.tilesets.forEach((tilesetData: TilemapTilesetData) => {
                var tileset = this.loadTileset(tilesetData, basePath)
                this.tilesets.push(tileset)
            })

            data.layers.forEach((layerData: TilemapLayerData) => {
                var layer: TilemapLayer
                if (layerData.objects != null)
                    layer = this.loadObjectLayer(layerData)
                else if (layerData.data != null)
                    layer = this.loadTileLayer(layerData)

                if (layer != null)
                    this.layers.push(layer)
            })
        }

        private loadTileset(tilesetData: TilemapTilesetData, basePath: string): Tileset {
            var tileset: Tileset = new Tileset()
            tileset.firstgid = tilesetData.firstgid

            var imagePath = basePath + '/' + tilesetData.image
            var image = new crackle.Image(imagePath, { sampleNearest: true })

            var tw = tilesetData.tilewidth
            var th = tilesetData.tileheight
            var cols = tilesetData.imagewidth / tw
            var rows = tilesetData.imageheight / th
            var tileIndex = 0
            for (var row = 0; row < rows; ++row) {
                for (var col = 0; col < cols; ++col) {
                    var tileImage = image.getRegion(col * tw, row * th, (col + 1) * tw, (row + 1) * th)
                    var tile = new Tile(tileImage)
                    if (tileIndex in tilesetData.tileproperties)
                        tile.properties = tilesetData.tileproperties[tileIndex]
                    tileset.tiles.push(tile)
                    ++tileIndex
                }
            }

            return tileset
        }

        private loadObjectLayer(layerData: TilemapLayerData): TilemapObjectLayer {
            var layer = new TilemapObjectLayer()
            layer.name = layerData.name
            layerData.objects.forEach((objectData) => {
                var obj = new TilemapObject()
                obj.x = objectData.x
                obj.y = objectData.y
                obj.name = objectData.name
                obj.tile = this.getTile(objectData.gid)
                obj.properties = objectData.properties
                layer.objects.push(obj)
            })
            return layer
        }

        private loadTileLayer(layerData: TilemapLayerData): TilemapTileLayer {
            var layer = new TilemapTileLayer()
            layer.name = layerData.name
            layer.tiles = layerData.data.map((gid) => this.getTile(gid))
            return layer
        }

        private getTile(gid: number): Tile {
            for (var i = 0; i < this.tilesets.length; ++i) {
                var tileset = this.tilesets[i]
                var index = gid - tileset.firstgid
                if (index >= 0 && index < tileset.tiles.length)
                    return tileset.tiles[index]
            }
            return null
        }

        getTileIndex(x: number, y: number): number {
            var tx = Math.floor(x / this.tileWidth)
            var ty = Math.floor(y / this.tileHeight)
            if (tx < 0 || tx >= this.cols ||
                ty < 0 || ty >= this.rows)
                return this.rows * this.cols - 1
            return ty * this.cols + tx
        }

        draw(rect: Rect) {
            var tw = this.tileWidth
            var th = this.tileHeight
            var tx1 = Math.max(0, Math.floor(rect.x1 / tw))
            var ty1 = Math.max(0, Math.floor(rect.y1 / th))
            var tx2 = Math.min(this.cols, Math.floor(rect.x2 / tw) + 1)
            var ty2 = Math.min(this.rows, Math.floor(rect.y2 / th) + 1)

            for (var layerIndex = 0; layerIndex < this.layers.length; ++layerIndex) {
                var layer = this.layers[layerIndex]

                if (layer instanceof TilemapTileLayer) {
                    for (var ty = ty1; ty < ty2; ++ty) {
                        var ti = ty * this.cols + tx1

                        for (var tx = tx1; tx < tx2; ++tx) {
                            var tile = (<TilemapTileLayer>layer).tiles[ti]
                            if (tile != null)
                                crackle.drawImage(tile.image, tx * tw, ty * th, (tx + 1) * tw, (ty + 1) * th)
                            ti += 1
                        }
                    }
                }
            }
        }

    }

}