// @refresh reset
import {
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type RefObject,
} from 'react'
import { cn } from 'cn'

import { hexCorners, hexToPixel, hexWidth, rectangleGrid } from '@/lib/hex'

const HEX_SIZE = 16
const COLS = 44
const ROWS = 30
const CHANGES_PER_SECOND = 24

// Each slot is a --hex-* color in index.css: Cyanotype in light mode, Blueprint in dark
const SLOT_CLASSES = ['fill-hex-1', 'fill-hex-2', 'fill-hex-3', 'fill-hex-4']
const SLOT_WEIGHTS = [4, 4, 3, 1.5]
const TOTAL_WEIGHT = SLOT_WEIGHTS.reduce((sum, weight) => sum + weight, 0)
const LOCKED_CLASS = 'fill-primary duration-0'

// A fifth slot: the hex fades out completely and stops reacting to the cursor
const EMPTY_SLOT = SLOT_CLASSES.length
const EMPTY_CLASS =
    'pointer-events-none fill-white/95 stroke-transparent dark:fill-transparent dark:stroke-transparent'

// Chance a hex goes empty: FOCUS_ODDS at the name's edge, easing down to BASE_ODDS
// by FOCUS_REACH screen pixels away
const FOCUS_ODDS = 0.8
const BASE_ODDS = 0.06
const FOCUS_REACH = 140

function emptyOddsAt(distance: number, reach: number) {
    const t = Math.min(distance / reach, 1)
    const eased = t * t * (3 - 2 * t) // "smoothstep": eases in and out instead of a straight line
    return BASE_ODDS + (FOCUS_ODDS - BASE_ODDS) * (1 - eased) ** 0.7
}

function randomSlot(emptyOdds: number) {
    if (Math.random() < emptyOdds) return EMPTY_SLOT

    let roll = Math.random() * TOTAL_WEIGHT
    for (let slot = 0; slot < SLOT_WEIGHTS.length; slot++) {
        roll -= SLOT_WEIGHTS[slot]
        if (roll < 0) return slot
    }
    return 0
}

const WIDTH = hexWidth(HEX_SIZE) * (COLS + 0.5)
const HEIGHT = HEX_SIZE * 1.5 * (ROWS - 1) + HEX_SIZE * 2

// The <g> shifts the grid so the first row and column aren't cut off
const GRID_OFFSET_X = hexWidth(HEX_SIZE) / 2
const GRID_OFFSET_Y = HEX_SIZE

const HEX_CENTERS = rectangleGrid(COLS, ROWS).map((hex) =>
    hexToPixel(hex, HEX_SIZE),
)

const HEX_POINTS = HEX_CENTERS.map((center) =>
    hexCorners(center, HEX_SIZE)
        .map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(' '),
)

type HexProps = {
    index: number
    points: string
    slot: number
    isLocked: boolean
    onPress: (index: number, shouldLock: boolean) => void
    onDragOver: (index: number) => void
    onTap: (index: number, shouldLock: boolean) => void
}

// memo: skip re-rendering unless this hex's own props changed
const Hex = memo(function Hex({
    index,
    points,
    slot,
    isLocked,
    onPress,
    onDragOver,
    onTap,
}: HexProps) {
    return (
        <polygon
            points={points}
            className={cn(
                'cursor-pointer stroke-foreground/25 transition-colors dark:stroke-border',
                isLocked
                    ? LOCKED_CLASS
                    : [
                          'duration-1500',
                          slot === EMPTY_SLOT
                              ? EMPTY_CLASS
                              : [
                                    'hover:fill-primary/70 hover:duration-0',
                                    SLOT_CLASSES[slot],
                                ],
                      ],
            )}
            onPointerDown={(event) => {
                if (event.pointerType !== 'mouse' || event.button !== 0) {
                    return
                }
                event.preventDefault()
                onPress(index, !isLocked)
            }}
            onPointerEnter={() => onDragOver(index)}
            onPointerUp={(event) => {
                if (event.pointerType === 'mouse') return
                onTap(index, !isLocked)
            }}
        />
    )
})

type HexFieldProps = {
    // The element the empty area centers on (the name in the hero)
    focusRef: RefObject<HTMLElement | null>
}

export function HexField({ focusRef }: HexFieldProps) {
    // null until the first measurement, so no hexes render before we know where the name is
    const [slots, setSlots] = useState<number[] | null>(null)
    const [locked, setLocked] = useState<Set<number>>(() => new Set())
    const dragMode = useRef<'lock' | 'unlock' | null>(null)
    const svgRef = useRef<SVGSVGElement>(null)
    // Each hex's chance of going empty on its next change; updated on resize without a re-render
    const emptyOdds = useRef<number[]>([])

    useLayoutEffect(() => {
        const svg = svgRef.current
        const focus = focusRef.current
        if (!svg || !focus) return

        const measure = () => {
            const box = svg.getBoundingClientRect()
            const name = focus.getBoundingClientRect()

            // "slice" scales the grid up until it covers the whole box, then centers it
            const scale = Math.max(box.width / WIDTH, box.height / HEIGHT)
            const cropX = (box.width - WIDTH * scale) / 2
            const cropY = (box.height - HEIGHT * scale) / 2

            // Screen pixels → the same units as HEX_CENTERS
            const toGridX = (x: number) =>
                (x - box.left - cropX) / scale - GRID_OFFSET_X
            const toGridY = (y: number) =>
                (y - box.top - cropY) / scale - GRID_OFFSET_Y

            const left = toGridX(name.left)
            const right = toGridX(name.right)
            const top = toGridY(name.top)
            const bottom = toGridY(name.bottom)
            const reach = FOCUS_REACH / scale

            emptyOdds.current = HEX_CENTERS.map(({ x, y }) => {
                // Distance from the hex's center to the nearest edge of the name (0 if inside it)
                const dx = Math.max(left - x, 0, x - right)
                const dy = Math.max(top - y, 0, y - bottom)
                return emptyOddsAt(Math.hypot(dx, dy), reach)
            })
        }

        measure()
        setSlots(emptyOdds.current.map((odds) => randomSlot(odds)))

        const observer = new ResizeObserver(measure)
        observer.observe(svg)
        observer.observe(focus)
        return () => observer.disconnect()
    }, [focusRef])

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return
        }

        const interval = setInterval(() => {
            setSlots((previous) => {
                if (!previous) return previous
                const next = [...previous]
                const index = Math.floor(Math.random() * next.length)
                next[index] = randomSlot(emptyOdds.current[index])
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

    // useCallback keeps these the same functions every render, so memo'd hexes don't re-render
    const setHexLocked = useCallback((index: number, shouldLock: boolean) => {
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
    }, [])

    const startDrag = useCallback(
        (index: number, shouldLock: boolean) => {
            dragMode.current = shouldLock ? 'lock' : 'unlock'
            setHexLocked(index, shouldLock)
        },
        [setHexLocked],
    )

    const dragOver = useCallback(
        (index: number) => {
            if (dragMode.current) {
                setHexLocked(index, dragMode.current === 'lock')
            }
        },
        [setHexLocked],
    )

    return (
        <svg
            ref={svgRef}
            aria-hidden
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="xMidYMid slice"
            className="pointer-events-auto absolute top-0 left-1/2 -z-10 h-svh w-screen -translate-x-1/2 mask-x-from-70% mask-t-from-85% mask-b-from-50% mask-b-to-99%"
        >
            <g transform={`translate(${GRID_OFFSET_X} ${GRID_OFFSET_Y})`}>
                                {slots &&
                    HEX_POINTS.map((points, index) => (
                        <Hex
                            key={index}
                            index={index}
                            points={points}
                            slot={slots[index]}
                            isLocked={locked.has(index)}
                            onPress={startDrag}
                            onDragOver={dragOver}
                            onTap={setHexLocked}
                        />
                    ))}
            </g>
        </svg>
    )
}