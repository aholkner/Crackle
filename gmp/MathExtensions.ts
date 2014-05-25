﻿interface Math {
    mod(n: number, m: number): number
    clamp(value: number, min: number, max: number): number
}

Math.mod = function(n: number, m: number): number {
    return ((n % m) + m) % m
}

Math.clamp = function (value: number, min: number, max: number): number {
    return Math.min(max, Math.max(value, min))
}