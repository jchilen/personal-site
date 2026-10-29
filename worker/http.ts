export function errorResponse(status: number, message: string): Response {
    return Response.json({ error: message }, { status })
}