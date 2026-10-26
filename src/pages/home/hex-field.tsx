import { useEffect, useState } from 'react'
import { cn } from 'cn'

import { hexCorners, hexToPixel, hexWidth, rectangleGrid } from '@/lib/hex'

const HEX_SIZE = 16
const COLS = 24
const ROWS = 13
const CHANGES_PER_SECOND = 2

// Each slot is a --hex-* color in index.css: Cyanotype in light mode, Blueprint in dark
const SLOT_CLASSES = ['fill-hex-1', 'fill-hex-2', 'fill-hex-3', 'fill-hex-4']
const SLOT_WEIGHTS = [4, 4, 3, 1.5]
const TOTAL_WEIGHT = SLOT_WEIGHTS.reduce((sum, weight) => sum + weight, 0)

function randomSlot() {
    let roll = Math.random() * TOTAL_WEIGHT
    for (let slot = 0; slot < SLOT_WEIGHTS.length; slot++) {
        roll -= SLOT_WEIGHTS[slot]
        if (roll < 0) return slot
    }
    return 0
}

const WIDTH = hexWidth(HEX_SIZE) * (COLS + 0.5)
const HEIGHT = HEX_SIZE * 1.5 * (ROWS - 1) + HEX_SIZE * 2

const HEX_POINTS = rectangleGrid(COLS, ROWS).map((hex) =>
    hexCorners(hexToPixel(hex, HEX_SIZE), HEX_SIZE)
        .map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(' '),
)

const INITIAL_SLOTS = HEX_POINTS.map(randomSlot)

export function HexField() {
    const [slots, setSlots] = useState(INITIAL_SLOTS)

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return
        }

        const interval = setInterval(() => {
            setSlots((previous) => {
                const next = [...previous]
                next[Math.floor(Math.random() * next.length)] = randomSlot()
                return next
            })
        }, 1000 / CHANGES_PER_SECOND)

        return () => clearInterval(interval)
    }, [])

    return (
        <svg
            aria-hidden
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="xMidYMid slice"
            className="h-[45svh] w-full mask-radial-from-30% mask-radial-to-72%"
        >
            <g transform={`translate(${hexWidth(HEX_SIZE) / 2} ${HEX_SIZE})`}>
                {HEX_POINTS.map((points, index) => (
                    <polygon
                        key={index}
                        points={points}
                        className={cn(
                            'stroke-foreground/25 transition-colors duration-1500 hover:fill-primary/70 hover:duration-0 dark:stroke-border',
                            SLOT_CLASSES[slots[index]],
                        )}
                    />
                ))}
            </g>
        </svg>
    )
}