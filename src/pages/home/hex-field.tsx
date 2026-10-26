// @refresh reset
import { useEffect, useRef, useState } from 'react'
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
const CHANGES_PER_SECOND = 24

// Each slot is a --hex-* color in index.css: Cyanotype in light mode, Blueprint in dark
const SLOT_CLASSES = ['fill-hex-1', 'fill-hex-2', 'fill-hex-3', 'fill-hex-4']
const SLOT_WEIGHTS = [4, 4, 3, 1.5]
const TOTAL_WEIGHT = SLOT_WEIGHTS.reduce((sum, weight) => sum + weight, 0)
const LOCKED_CLASS = 'fill-primary duration-0'

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
    const [locked, setLocked] = useState<Set<number>>(() => new Set())
    const dragMode = useRef<'lock' | 'unlock' | null>(null)

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

    useEffect(() => {
        function endDrag() {
            dragMode.current = null
        }

        window.addEventListener('pointerup', endDrag)
        return () => window.removeEventListener('pointerup', endDrag)
    }, [])

    function setHexLocked(index: number, shouldLock: boolean) {
        setLocked((previous) => {
            if (previous.has(index) === shouldLock) return previous

            const next = new Set(previous)
            if (shouldLock) {
                next.add(index)
            } else {
                next.delete(index)
            }
            return next
        })
    }

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
                        'cursor-pointer stroke-foreground/25 transition-colors dark:stroke-border',
                        locked.has(index)
                            ? LOCKED_CLASS
                            : [
                                  'duration-1500 hover:fill-primary/70 hover:duration-0',
                                  SLOT_CLASSES[slots[index]],
                              ],
                        fadeClass,
                    )}
                    onPointerDown={(event) => {
                        if (event.pointerType !== 'mouse' || event.button !== 0) {
                            return
                        }
                        event.preventDefault()
                        const shouldLock = !locked.has(index)
                        dragMode.current = shouldLock ? 'lock' : 'unlock'
                        setHexLocked(index, shouldLock)
                    }}
                    onPointerEnter={() => {
                        if (dragMode.current) {
                            setHexLocked(index, dragMode.current === 'lock')
                        }
                    }}
                    onPointerUp={(event) => {
                        if (event.pointerType === 'mouse') return
                        setHexLocked(index, !locked.has(index))
                    }}
                />
            ))}
        </svg>
    )
}