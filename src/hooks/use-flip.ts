import { useLayoutEffect, useRef, type RefObject } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

// Matches the page's view-transition glide
const GLIDE = { duration: 450, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }

type Spot = { x: number; y: number }

// Where an item sits inside its parent. Measured this way rather than on the screen, an item
// glides only by how far it moved within the list, even when the list itself moves too, like
// when a centered dialog shrinks and its top edge comes down
function spotInParent(item: HTMLElement): Spot {
    const rect = item.getBoundingClientRect()
    const parent = item.parentElement?.getBoundingClientRect()
    return {
        x: rect.left - (parent?.left ?? 0),
        y: rect.top - (parent?.top ?? 0),
    }
}

/**
 * Glides items to their new places after a change, for spots where a view transition can't be
 * used, like inside a dialog: a view transition snapshots the whole page, and the page's own
 * gliding elements would be drawn over the dialog. This is the FLIP technique: measure where each
 * item is (First), make the change, see where it ended up (Last), then start it back where it was
 * (Invert) and slide it to its new spot (Play).
 *
 * `box` is an element holding the items, like a dialog. Its height glides to its new size along
 * with the items, rather than snapping.
 *
 * Put `ref(key)` on each item, and call `measure()` just before the change
 */
export function useFlip<K>(box?: RefObject<HTMLElement | null>): {
    ref: (key: K) => (node: HTMLElement | null) => void
    measure: () => void
} {
    const items = useRef(new Map<K, HTMLElement>())
    // Where each item was, and how tall the box was, just before the change, until the render
    // after it uses them
    const before = useRef<{
        spots: Map<K, Spot>
        height: number | undefined
    } | null>(null)

    // After every render, but it only does anything right after measure() was called. A layout
    // effect runs before the browser paints, so nothing shows in its new spot or size first
    useLayoutEffect(() => {
        const first = before.current
        if (!first) return
        before.current = null
        if (prefersReducedMotion()) return

        // Both start in the same frame with the same timing, so the box's edge and the items
        // moving up to fill the gap stay together
        const boxNow = box?.current
        if (boxNow && first.height !== undefined) {
            const height = boxNow.getBoundingClientRect().height
            if (height !== first.height) {
                boxNow.animate(
                    [
                        { height: `${first.height}px` },
                        { height: `${height}px` },
                    ],
                    GLIDE,
                )
            }
        }

        for (const [key, item] of items.current) {
            const old = first.spots.get(key)
            if (!old) continue
            const now = spotInParent(item)
            const x = old.x - now.x
            const y = old.y - now.y
            if (x === 0 && y === 0) continue
            item.animate(
                [
                    { transform: `translate(${x}px, ${y}px)` },
                    { transform: 'none' },
                ],
                GLIDE,
            )
        }
    })

    return {
        ref: (key) => (node) => {
            if (node) items.current.set(key, node)
            else items.current.delete(key)
        },
        measure: () => {
            before.current = {
                spots: new Map(
                    [...items.current].map(([key, item]) => [
                        key,
                        spotInParent(item),
                    ]),
                ),
                height: box?.current?.getBoundingClientRect().height,
            }
        },
    }
}
