interface Env {
    DB: D1Database
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url)

        if (url.pathname === '/api/health') {
            const row = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>()
            return Response.json({ status: 'ok', database: row?.ok === 1 })
        }

        return Response.json({ error: 'Not found' }, { status: 404 })
    },
} satisfies ExportedHandler<Env>