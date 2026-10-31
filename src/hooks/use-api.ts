import { useCallback, useEffect, useState } from 'react'
import { errorMessage, requestJson } from '@/lib/api'

export type ApiState<T> =
    | { status: 'loading' }
    | { status: 'error'; error: string }
    | { status: 'success'; data: T }

/**
 * Loads JSON from our API when the component appears, and again whenever `url` changes.
 * `reload` fetches again, for after something changed the data (like creating a poll).
 */
export function useApi<T>(url: string) {
    const [state, setState] = useState<ApiState<T>>({ status: 'loading' })
    const [version, setVersion] = useState(0)

    useEffect(() => {
        const controller = new AbortController()

        requestJson<T>(url, { signal: controller.signal })
            .then((data) => setState({ status: 'success', data }))
            .catch((error: unknown) => {
                if (controller.signal.aborted) return
                setState({ status: 'error', error: errorMessage(error) })
            })

        // Cancels the request if the component goes away (or the URL changes) before it finishes
        return () => controller.abort()
    }, [url, version])

    const reload = useCallback(() => setVersion((current) => current + 1), [])

    return { state, reload }
}