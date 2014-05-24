interface Array<T> {
    min(func?: { (element: T) }): number
    max(func?: { (element: T) }): number
    sum(func?: { (element: T) }): number

    last(): T
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

Array.prototype.last = function () {
    return this[this.length - 1]
}