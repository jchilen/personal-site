import { useEffect, useRef } from 'react'

type FindTarget = () => HTMLElement | null | undefined

/**
 * Moves focus once a change is on screen. Call the returned function just before a state change
 * that removes, moves or disables the focused element, with a way to find where focus should go.
 * It checks after every render until it finds the target, because changes run through
 * animateLayout reach the page a moment later, after the browser has taken its "before" snapshot
 */
export function useFocusAfterRender(): (findTarget: FindTarget) => void {
    const pending = useRef<FindTarget | null>(null)

    // No dependency list on purpose: it runs after every render, and does nothing unless asked
    useEffect(() => {
        const target = pending.current?.()
        if (target) {
            pending.current = null
            target.focus()
        }
    })

    return (findTarget) => {
        pending.current = findTarget
    }
}
