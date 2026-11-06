import { expect, test } from 'vitest'
import { signed } from './format'

test('signed numbers get a plus, or a real minus sign (−, not the hyphen -)', () => {
    expect([3, 0, -2].map(signed)).toEqual(['+3', '0', '−2'])
})
