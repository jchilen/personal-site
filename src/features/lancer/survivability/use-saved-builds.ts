import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { restoreSaves, toStoredSaves, type SavedBuild } from './saved-builds'

const STORAGE_KEY = 'frame-survivability-saved-builds'

// Browser storage can be unavailable (some private windows) or hold anything, so this never throws
function loadSaves(): SavedBuild[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        return restoreSaves(stored === null ? null : JSON.parse(stored))
    } catch {
        return []
    }
}

/**
 * The saved builds, remembered in this browser between visits, separately from the cards on the
 * page. Change them with the functions in saved-builds.ts, like setSaves((saves) => deleteSave(...))
 */
export function useSavedBuilds(): [
    SavedBuild[],
    Dispatch<SetStateAction<SavedBuild[]>>,
] {
    // Passing the function, not its result, loads the saves on the first render only
    const [saves, setSaves] = useState(loadSaves)

    // Store after every change
    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(toStoredSaves(saves)),
            )
        } catch {
            // Storage is unavailable or full; saving still works until the page is closed
        }
    }, [saves])

    return [saves, setSaves]
}
