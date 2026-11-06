import { useEffect, useState } from 'react'

// Near the top of the page, the header always shows
const TOP_ZONE = 80
// Scroll changes smaller than this are ignored, so tiny jitters (like a trackpad's bounce) don't flicker it
const THRESHOLD = 8

/** True while the user is scrolling down the page; false near the top, and as soon as they scroll up */
export function useHideOnScroll(): boolean {
    const [hidden, setHidden] = useState(false)

    useEffect(() => {
        let last = window.scrollY

        function handleScroll() {
            const current = window.scrollY
            if (current < TOP_ZONE) {
                setHidden(false)
            } else if (Math.abs(current - last) < THRESHOLD) {
                // Too small to count yet. Keeping the old position lets small moves add up
                return
            } else {
                setHidden(current > last)
            }
            last = current
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return hidden
}
