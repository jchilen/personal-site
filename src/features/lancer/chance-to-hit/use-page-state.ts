import { useEffect, useReducer, type Dispatch } from 'react'
import { pageReducer, type PageAction } from './page-reducer'
import { restoreState, toSaved } from './saved-settings'
import { DEFAULT_STATE, type PageState } from './settings'

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

/**
 * The page's settings, remembered in this browser between visits. Every change goes through
 * pageReducer, as an action passed to `dispatch`
 */
export function usePageState(): {
    state: PageState
    dispatch: Dispatch<PageAction>
} {
    // The third argument loads the saved state once, on the first render only
    const [state, dispatch] = useReducer(pageReducer, null, loadState)

    // Save after every change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSaved(state)))
        } catch {
            // Storage is unavailable or full; the page still works, it just won't remember
        }
    }, [state])

    return { state, dispatch }
}
