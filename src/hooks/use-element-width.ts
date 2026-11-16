import { useCallback, useState, type RefCallback } from 'react'

/**
 * An element's width in pixels, kept up to date as it resizes. Put the returned ref on the element;
 * the width is 0 until it's on the page. For layouts CSS can't work out alone, like keeping chart
 * labels from overlapping
 */
export function useElementWidth(): [RefCallback<HTMLElement>, number] {
    const [width, setWidth] = useState(0)

    // A ResizeObserver reports the element's size once as it starts watching, then after every
    // change. Returning the cleanup from the ref (React 19) stops watching when the element goes
    const ref = useCallback((node: HTMLElement | null) => {
        if (!node) return
        const observer = new ResizeObserver(([entry]) =>
            setWidth(entry.contentRect.width),
        )
        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    return [ref, width]
}
