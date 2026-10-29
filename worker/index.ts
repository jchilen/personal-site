import type { Env } from './env'
import { errorResponse } from './http'
import { createPoll } from './polls'

export default {
    async fetch(request, env) {
        const url = new URL(request.url)

        if (url.pathname === '/api/health') {
            const row = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>()
            return Response.json({ status: 'ok', database: row?.ok === 1 })
        }

        if (url.pathname === '/api/polls' && request.method === 'POST') {
            return createPoll(request, env)
        }

        return errorResponse(404, 'Not found')
    },
} satisfies ExportedHandler<Env>