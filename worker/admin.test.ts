import { expect, test } from 'vitest'
import { verifiedAdminToken } from './admin'
import { sha256 } from './tokens'

function requestWith(headers: Record<string, string>): Request {
    return new Request('https://icenine.dev/api/polls/abc/status', { headers })
}

test("the admin token is accepted from the backup link's header or the cookie, and only if it matches", async () => {
    const hash = await sha256('secret')

    expect(
        await verifiedAdminToken(
            requestWith({ Authorization: 'Bearer secret' }),
            hash,
        ),
    ).toBe('secret')
    expect(
        await verifiedAdminToken(
            requestWith({ Cookie: 'poll_admin=secret' }),
            hash,
        ),
    ).toBe('secret')
    expect(
        await verifiedAdminToken(
            requestWith({ Authorization: 'Bearer wrong' }),
            hash,
        ),
    ).toBeNull()
    expect(await verifiedAdminToken(requestWith({}), hash)).toBeNull()
})
