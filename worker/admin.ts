import { getCookie } from './http'
import { sha256 } from './tokens'

// The admin token comes from this browser's cookie, or from the backup admin link,
// whose page reads the token from the link and sends it as "Authorization: Bearer <token>"
export function findAdminToken(request: Request): string | undefined {
    const header = request.headers.get('Authorization')
    if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length)
    return getCookie(request, 'poll_admin')
}

export async function isAdmin(
    request: Request,
    adminTokenHash: string,
): Promise<boolean> {
    const token = findAdminToken(request)
    if (!token) return false
    return (await sha256(token)) === adminTokenHash
}
