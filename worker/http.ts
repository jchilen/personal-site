import type { Env } from './env'

// Values captured from the path, like { id: 'FhGttZmrjkM' } for /api/polls/:id
export type Params = Record<string, string | undefined>

export type Handler = (
    request: Request,
    env: Env,
    params: Params,
) => Promise<Response>
export function errorResponse(status: number, message: string): Response {
    return Response.json({ error: message }, { status })
}

// Reads one cookie from the request's Cookie header, which looks like "a=1; b=2"
export function getCookie(request: Request, name: string): string | undefined {
    const header = request.headers.get('Cookie') ?? ''
    for (const pair of header.split(';')) {
        const [key, ...rest] = pair.trim().split('=')
        if (key === name) return rest.join('=')
    }
    return undefined
}

// Counts this request against a limiter, keyed by the visitor's IP address. False means over the limit
export async function withinRateLimit(
    limiter: RateLimit,
    request: Request,
): Promise<boolean> {
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
    const { success } = await limiter.limit({ key: ip })
    return success
}

// HttpOnly: page scripts can't read it. Secure: HTTPS only. SameSite=Strict: only sent by your own site
export function cookie(
    name: string,
    value: string,
    path: string,
    maxAgeDays: number,
): string {
    return [
        `${name}=${value}`,
        `Path=${path}`,
        `Max-Age=${maxAgeDays * 24 * 60 * 60}`,
        'HttpOnly',
        'Secure',
        'SameSite=Strict',
    ].join('; ')
}
