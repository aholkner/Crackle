interface Array<T> {
    remove(elem: any)

    min(func?: { (element: T) }): number
    max(func?: { (element: T) }): number
    sum(func?: { (element: T) }): number

    findFirst(predicate: { (p: T): boolean }): T
    last(): T

    weightedChoice(weightFunc: { (element: T): number }): T
}

Array.prototype.remove = function (elem) {
    var index = this.indexOf(elem)
    if (index != -1)
        this.splice(index, 1)
}

Array.prototype.min = function (func) {
    if (func == null) {
        return this.reduce(function (a, b) { return Math.min(a, b) })
    } else {
        return this.reduce(function (a, b) { return Math.min(a, func(b)) }, func(this[0]))
    }
}

Array.prototype.max = function (func) {
    if (func == null) {
        return this.reduce(function (a, b) { return Math.max(a, b) })
    } else {
        return this.reduce(function (a, b) { return Math.max(a, func(b)) }, func(this[0]))
    }
}

Array.prototype.sum = function (func) {
    if (func == null) {
        return this.reduce(function (a, b) { return a + b })
    } else {
        return this.reduce(function (a, b) { return a + func(b) }, 0)
    }
}


Array.prototype.findFirst = function (predicate) {
    for (var i = 0; i < this.length; ++i) {
        if (predicate(this[i]))
            return this[i]
    }
}

Array.prototype.last = function () {
    return this[this.length - 1]
}

Array.prototype.weightedChoice = function (weightFunc) {
    var total = this.sum((elem) => weightFunc(elem))
    var r = Math.random() * total
    var upto = 0
    for (var i = 0; i < this.length; ++i) {
        upto += weightFunc(this[i])
        if (upto > r)
            return this[i]
    }
    return this.last()
}