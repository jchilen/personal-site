import { getCookie } from './http'
import { sha256 } from './tokens'

// The admin token comes from this browser's cookie, or from the backup admin link,
// whose page reads the token from the link and sends it as "Authorization: Bearer <token>"
function findAdminToken(request: Request): string | undefined {
    const header = request.headers.get('Authorization')
    if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length)
    return getCookie(request, 'poll_admin')
}

// The request's admin token if it matches the poll's stored hash, otherwise null. Returning the
// token itself lets claimAdmin put the exact token it checked into the cookie
export async function verifiedAdminToken(
    request: Request,
    adminTokenHash: string,
): Promise<string | null> {
    const token = findAdminToken(request)
    if (!token) return null
    return (await sha256(token)) === adminTokenHash ? token : null
}

export async function isAdmin(
    request: Request,
    adminTokenHash: string,
): Promise<boolean> {
    return (await verifiedAdminToken(request, adminTokenHash)) !== null
}
