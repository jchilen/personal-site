import { describe, expect, test } from 'vitest'
import { DEFAULT_STATE, restoreState, type PageState } from './settings'

describe('restoreState', () => {
    test('nothing saved: the defaults', () => {
        expect(restoreState(null)).toEqual(DEFAULT_STATE)
    })

    test('a save that isn’t an object: the defaults', () => {
        expect(restoreState('hello')).toEqual(DEFAULT_STATE)
        expect(restoreState(42)).toEqual(DEFAULT_STATE)
    })

    test('a complete, valid save comes back exactly', () => {
        const saved: PageState = {
            ...DEFAULT_STATE,
            attackType: 'tech',
            ruleset: 'rebake',
            tier: 3,
            licenseLevel: 7,
            frameTechAttack: -2,
            systems: 4,
            cover: 'soft',
            lockOn: true,
            featured: 'Witch',
        }
        expect(restoreState(saved)).toEqual(saved)
    })

    test('one bad value resets only itself', () => {
        const restored = restoreState({ ...DEFAULT_STATE, licenseLevel: 40, tier: 2, lockOn: true })
        expect(restored.licenseLevel).toBe(DEFAULT_STATE.licenseLevel)
        expect(restored.tier).toBe(2)
        expect(restored.lockOn).toBe(true)
    })

    test('wrong types and unknown options fall back to the defaults', () => {
        const restored = restoreState({
            attackType: 'laser',
            cover: 'diagonal',
            systems: 2.5,
            prone: 'yes',
            tier: '3',
            featured: 7,
        })
        expect(restored).toEqual(DEFAULT_STATE)
    })

    test('an older save missing newer settings keeps what it has', () => {
        expect(restoreState({ tier: 3 })).toEqual({ ...DEFAULT_STATE, tier: 3 })
    })
})