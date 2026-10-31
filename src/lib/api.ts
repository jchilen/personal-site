// An error our API reported on purpose, so its message is safe to show
export class ApiError extends Error {}

/** Calls our API and returns its JSON. Failures become an ApiError with a message for people */
export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
    let response: Response
    try {
        response = await fetch(url, init)
    } catch (error) {
        // A cancelled request isn't a failure; let the caller recognize it
        if (init?.signal?.aborted) throw error
        throw new ApiError("Couldn't reach the server. Check your connection and try again.")
    }

    const body = await response.json()
    if (!response.ok) throw new ApiError(body.error ?? 'Something went wrong.')
    return body as T
}

export function postJson<T>(url: string, data: unknown): Promise<T> {
    return requestJson<T>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
}

/** The message to show for anything thrown by the functions above */
export function errorMessage(error: unknown): string {
    return error instanceof ApiError ? error.message : 'Something went wrong.'
}