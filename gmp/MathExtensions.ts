interface Math {
    mod(n: number, m: number): number
}

Math.mod = function (n: number, m: number): number {
    return ((n % m) + m) % m
}