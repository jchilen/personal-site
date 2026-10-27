// @refresh reset
import { useEffect, useRef, useState } from 'react'
import { cn } from 'cn'

import { hexCorners, hexToPixel, hexWidth, rectangleGrid } from '@/lib/hex'

const HEX_SIZE = 16
const COLS = 44
const ROWS = 30
const CHANGES_PER_SECOND = 6

// Each slot is a --hex-* color in index.css: Cyanotype in light mode, Blueprint in dark
const SLOT_CLASSES = ['fill-hex-1', 'fill-hex-2', 'fill-hex-3', 'fill-hex-4']
const SLOT_WEIGHTS = [4, 4, 3, 1.5]
const TOTAL_WEIGHT = SLOT_WEIGHTS.reduce((sum, weight) => sum + weight, 0)
const LOCKED_CLASS = 'fill-primary duration-0'

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
        <>
            <svg
                aria-hidden
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="xMidYMid slice"
                className="pointer-events-auto absolute inset-y-0 left-1/2 -z-10 h-full w-screen -translate-x-1/2 mask-x-from-70% mask-t-from-85% mask-b-from-50% mask-b-to-99%"
            >
                <g transform={`translate(${hexWidth(HEX_SIZE) / 2} ${HEX_SIZE})`}>
                    {HEX_POINTS.map((points, index) => (
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
                </g>
            </svg>
        </>
    )
}