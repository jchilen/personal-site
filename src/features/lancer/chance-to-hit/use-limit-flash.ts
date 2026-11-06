import { useState } from 'react'

/**
 * A warning that flashes each time someone tries to add past the limit. Each try bumps `count`;
 * using it as the warning's key remounts it, which replays the flash
 */
export function useLimitFlash(full: boolean) {
    const [count, setCount] = useState(0)

    // Once there's room again, forget earlier flashes, so filling up later doesn't show a stale
    // warning. Setting state while rendering is fine here: React re-renders before showing anything
    if (!full && count !== 0) setCount(0)

    return {
        count,
        visible: full && count > 0,
        flash: () => setCount((current) => current + 1),
        clear: () => setCount(0),
    }
}
