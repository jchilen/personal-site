// @refresh reset
import { useEffect, useState } from 'react'
import { cn } from 'cn'

import {
    hexCorners,
    hexDistance,
    hexesWithin,
    hexToPixel,
    hexWidth,
} from '@/lib/hex'

const HEX_SIZE = 16
const RADIUS = 14
const CHANGES_PER_SECOND = 12

// Each slot is a --hex-* color in index.css: Cyanotype in light mode, Blueprint in dark
const SLOT_CLASSES = ['fill-hex-1', 'fill-hex-2', 'fill-hex-3', 'fill-hex-4']
const SLOT_WEIGHTS = [4, 4, 3, 1.5]
const TOTAL_WEIGHT = SLOT_WEIGHTS.reduce((sum, weight) => sum + weight, 0)

// The outermost rings step down in opacity, so the grid fades out as a hexagon
const RING_FADE = ['opacity-80', 'opacity-60', 'opacity-40', 'opacity-25', 'opacity-10']
const FIRST_FADE_RING = RADIUS - RING_FADE.length + 1

function randomSlot() {
    let roll = Math.random() * TOTAL_WEIGHT
    for (let slot = 0; slot < SLOT_WEIGHTS.length; slot++) {
        roll -= SLOT_WEIGHTS[slot]
        if (roll < 0) return slot
    }
    return 0
}

const WIDTH = hexWidth(HEX_SIZE) * (2 * RADIUS + 1)
const HEIGHT = HEX_SIZE * (3 * RADIUS + 2)

const HEXES = hexesWithin(RADIUS).map((hex) => ({
    points: hexCorners(hexToPixel(hex, HEX_SIZE), HEX_SIZE)
        .map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(' '),
    fadeClass: RING_FADE[hexDistance(hex, { q: 0, r: 0 }) - FIRST_FADE_RING],
}))

const INITIAL_SLOTS = HEXES.map(randomSlot)

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
            viewBox={`${-WIDTH / 2} ${-HEIGHT / 2} ${WIDTH} ${HEIGHT}`}
            className="absolute inset-y-0 left-1/2 h-full -translate-x-1/2"
            style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        >
            {HEXES.map(({ points, fadeClass }, index) => (
                <polygon
                    key={index}
                    points={points}
                    className={cn(
                        'stroke-foreground/25 transition-colors duration-1500 hover:fill-primary/70 hover:duration-0 dark:stroke-border',
                        SLOT_CLASSES[slots[index]],
                        fadeClass,
                    )}
                />
            ))}
        </svg>
    )
}