import { hexCorners, hexToPixel, hexWidth, rectangleGrid } from '@/lib/hex'
import { hashString, seededRandom } from '@/lib/random'

const HEX_SIZE = 8

type HexMosaicProps = {
    seed: string
    // For a featured card two columns wide. Only the width changes, so its header stays the same
    // height as the small cards' and the cards line up below it
    wide?: boolean
}

export function HexMosaic({ seed, wide = false }: HexMosaicProps) {
    const width = wide ? 480 : 240
    const height = 48
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
        <div aria-hidden="true" className="h-12 overflow-hidden border-b">
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
