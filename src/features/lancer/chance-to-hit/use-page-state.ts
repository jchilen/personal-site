import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_STATE, restoreState, type PageState } from './settings'

const STORAGE_KEY = 'chance-to-hit-settings'

// Browser storage can be unavailable (some private windows) or hold anything, so this never throws
function loadState(): PageState {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        return restoreState(saved === null ? null : JSON.parse(saved))
    } catch {
        return DEFAULT_STATE
    }
}

/** The page's settings, remembered in this browser between visits */
export function usePageState() {
    const [state, setState] = useState(loadState)

    // Save after every change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        } catch {
            // Storage is unavailable or full; the page still works, it just won't remember
        }
    }, [state])

    // Change only the given settings, keeping the rest
    const update = useCallback(
        (changes: Partial<PageState>) => setState((current) => ({ ...current, ...changes })),
        [],
    )

    return { state, update }
}