module gmp {

    export class GoogleSpreadsheet {

        worksheets: { [name: string]: Object[] } = {}

        constructor(public key: string) {
            var src = 'http://spreadsheets.google.com/feeds/worksheets/' + this.key + '/public/full?alt=json'
            crackle.ResourceQueue.current.loadJson(src, (worksheetList: {}) => {
                this.onWorksheetListLoaded(worksheetList)
            })
        }

        private onWorksheetListLoaded(worksheetList: any) {
            // Download all worksheets in spreadsheet
            worksheetList.feed.entry.forEach((entry) => {
                var title = entry.title["$t"]
                entry.link.forEach((link) => {
                    if (link.rel == "http://schemas.google.com/spreadsheets/2006#cellsfeed") {
                        var href: string = link.href + '?alt=json'
                        crackle.ResourceQueue.current.loadJson(href, (data) => {
                            this.onWorksheetLoaded(title, data)
                        })
                    }
                })
            })
        }

        private onWorksheetLoaded(title: string, data: any) {
            // Parse cells feed assuming header row
            var rowCount = parseInt(data.feed['gs$rowCount']['$t'])
            var colCount = parseInt(data.feed['gs$colCount']['$t'])
            var cells = new Array(rowCount)
            for (var i = 0; i < rowCount; ++i)
                cells[i] = new Array(colCount)
            
            var entries = data.feed.entry
            for (var i = 0; i < entries.length; ++i) {
                var cell = entries[i]
                var value = cell.content['$t']
                var rowIndex = parseInt(cell['gs$cell'].row)
                var colIndex = parseInt(cell['gs$cell'].col)
                cells[rowIndex - 1][colIndex - 1] = value
            }

            var rows = []
            var headers = cells[0]
            for (var i = 0; i < colCount; ++i) {
                if (headers[i])
                    headers[i] = headers[i].toLowerCase()
            }

            for (var i = 1; i < rowCount; ++i) {
                var cellRow = cells[i]
                var row = {}
                for (var j = 0; j < colCount; ++j) {
                    var header = headers[j]
                    if (header)
                        row[header] = cellRow[j]
                }
                rows.push(row)
            }

            this.worksheets[title.toLowerCase()] = rows
        }


    }

} 