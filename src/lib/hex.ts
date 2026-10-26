export type Hex = { q: number; r: number }
export type Point = { x: number; y: number }

const SQRT3 = Math.sqrt(3)

export function hexWidth(size: number) {
    return SQRT3 * size
}

export function hexToPixel({ q, r }: Hex, size: number): Point {
    return { x: size * SQRT3 * (q + r / 2), y: size * 1.5 * r }
}

export function hexCorners({ x, y }: Point, size: number): Point[] {
    return Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 180) * (60 * i - 30)
        return { x: x + size * Math.cos(angle), y: y + size * Math.sin(angle) }
    })
}

export function rectangleGrid(cols: number, rows: number): Hex[] {
    const hexes: Hex[] = []
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            hexes.push({ q: col - (row - (row & 1)) / 2, r: row })
        }
    }
    return hexes
}