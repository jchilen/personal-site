import { describe, expect, test } from 'vitest'
import { getCookie } from './http'
import { isClosed, pollCookie } from './polls'

describe('cookies', () => {
    test("a poll's admin cookie: sent only to that poll's API, for 7 days, and hidden from page scripts", () => {
        expect(pollCookie('poll_admin', 'token', 'abc')).toBe(
            'poll_admin=token; Path=/api/polls/abc; Max-Age=604800; HttpOnly; Secure; SameSite=Strict',
        )
    })

    test('reads one cookie from the header, even when its value contains =', () => {
        const request = new Request('https://icenine.dev/api/polls/mine', {
            headers: { Cookie: 'theme=dark; poll_creator=ab=cd; other=1' },
        })
        expect(getCookie(request, 'poll_creator')).toBe('ab=cd')
        expect(getCookie(request, 'poll_voter_id')).toBeUndefined()
    })
})

test('a poll counts as closed once its creator closes it, or from the moment it expires', () => {
    const open = { closed_at: null, expires_at: 1000 }
    expect(isClosed(open, 999)).toBe(false)
    expect(isClosed(open, 1000)).toBe(true)
    expect(isClosed({ closed_at: 500, expires_at: 1000 }, 0)).toBe(true)
})
