import { useCallback, useEffect, useState } from 'react'

export type ApiState<T> =
    | { status: 'loading' }
    | { status: 'error'; error: string }
    | { status: 'success'; data: T }

// An error our API reported on purpose, so its message is safe to show
class ApiError extends Error {}

/**
 * Loads JSON from our API when the component appears, and again whenever `url` changes.
 * `reload` fetches again, for after something changed the data (like creating a poll).
 */
export function useApi<T>(url: string) {
    const [state, setState] = useState<ApiState<T>>({ status: 'loading' })
    const [version, setVersion] = useState(0)

    useEffect(() => {
        const controller = new AbortController()

        fetch(url, { signal: controller.signal })
            .then(async (response) => {
                const body = await response.json()
                if (!response.ok)
                    throw new ApiError(body.error ?? 'Something went wrong.')
                setState({ status: 'success', data: body as T })
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return
                setState({
                    status: 'error',
                    error:
                        error instanceof ApiError
                            ? error.message
                            : "Couldn't reach the server. Check your connection and try again.",
                })
            })

        // Cancels the request if the component goes away (or the URL changes) before it finishes
        return () => controller.abort()
    }, [url, version])

    const reload = useCallback(() => setVersion((current) => current + 1), [])

    return { state, reload }
}
