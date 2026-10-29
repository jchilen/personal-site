import type { Env } from './env'

// Values captured from the path, like { id: 'FhGttZmrjkM' } for /api/polls/:id
export type Params = Record<string, string | undefined>

export type Handler = (request: Request, env: Env, params: Params) => Promise<Response>
export function errorResponse(status: number, message: string): Response {
    return Response.json({ error: message }, { status })
}