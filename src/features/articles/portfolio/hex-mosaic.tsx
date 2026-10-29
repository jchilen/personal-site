import { cn } from 'cn'
import { hexCorners, hexToPixel, hexWidth, rectangleGrid } from '@/lib/hex'

const HEX_SIZE = 8

// Turns text into a number (an FNV-1a hash), so the same title always gives the same pattern
function hashString(text: string) {
    let hash = 2166136261
    for (const char of text) {
        hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
    }
    return hash >>> 0
}

// A tiny seeded random number generator (mulberry32): the same seed always gives the same sequence
function seededRandom(seed: number) {
    let state = seed
    return () => {
        state = (state + 0x6d2b79f5) | 0
        let t = Math.imul(state ^ (state >>> 15), 1 | state)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

type HexMosaicProps = {
    seed: string
    tall?: boolean
}

export function HexMosaic({ seed, tall = false }: HexMosaicProps) {
    const width = tall ? 480 : 240
    const height = tall ? 64 : 48
    const random = seededRandom(hashString(seed))
    const cols = Math.ceil(width / hexWidth(HEX_SIZE)) + 1
    const rows = Math.ceil(height / (HEX_SIZE * 1.5)) + 1

    const hexes = rectangleGrid(cols, rows).flatMap((hex) => {
        if (random() < 0.32) return [] // leave a gap here
        const points = hexCorners(hexToPixel(hex, HEX_SIZE), HEX_SIZE)
            .map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`)
            .join(' ')
        return [{ points, opacity: 0.15 + random() * 0.6 }]
    })

    return (
        <div
            aria-hidden="true"
            className={cn('overflow-hidden border-b', tall ? 'h-16' : 'h-12')}
        >
            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid slice"
                className="size-full fill-(--category-color) stroke-card"
            >
                {hexes.map((hex, index) => (
                    <polygon
                        key={index}
                        points={hex.points}
                        fillOpacity={hex.opacity}
                    />
                ))}
            </svg>
        </div>
    )
}