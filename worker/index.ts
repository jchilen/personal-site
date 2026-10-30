import type { Env } from './env'
import { errorResponse, type Handler } from './http'
import { castBallot, createPoll, getPoll } from './polls'
import { closePoll, getResults, getStatus } from './results'
import { deleteOldPolls } from './cleanup'

async function health(_request: Request, env: Env): Promise<Response> {
    const row = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>()
    return Response.json({ status: 'ok', database: row?.ok === 1 })
}

// Each route: an HTTP method, a URL pattern (":id" captures that part of the path), and its handler
const routes: { method: string; pattern: URLPattern; handler: Handler }[] = [
    {
        method: 'GET',
        pattern: new URLPattern({ pathname: '/api/health' }),
        handler: health,
    },
    {
        method: 'POST',
        pattern: new URLPattern({ pathname: '/api/polls' }),
        handler: createPoll,
    },
    {
        method: 'GET',
        pattern: new URLPattern({ pathname: '/api/polls/:id' }),
        handler: getPoll,
    },
    {
        method: 'POST',
        pattern: new URLPattern({ pathname: '/api/polls/:id/ballots' }),
        handler: castBallot,
    },
    {
        method: 'GET',
        pattern: new URLPattern({ pathname: '/api/polls/:id/status' }),
        handler: getStatus,
    },
    {
        method: 'POST',
        pattern: new URLPattern({ pathname: '/api/polls/:id/close' }),
        handler: closePoll,
    },
    {
        method: 'GET',
        pattern: new URLPattern({ pathname: '/api/polls/:id/results' }),
        handler: getResults,
    },
]

export default {
    async fetch(request, env) {
        for (const route of routes) {
            if (route.method !== request.method) continue
            const match = route.pattern.exec(request.url)
            if (!match) continue

            try {
                return await route.handler(request, env, match.pathname.groups)
            } catch (error) {
                console.error(error)
                return errorResponse(500, 'Something went wrong')
            }
        }

        return errorResponse(404, 'Not found')
    },
    // Runs on the schedule in wrangler.jsonc, not for requests
    async scheduled(controller, env) {
        await deleteOldPolls(env, controller.scheduledTime)
    },
} satisfies ExportedHandler<Env>
