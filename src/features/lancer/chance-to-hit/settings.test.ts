import { describe, expect, test } from 'vitest'
import {
    DEFAULT_STATE,
    newTarget,
    restoreState,
    type PageState,
} from './settings'

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
            targets: [
                {
                    id: 'a',
                    name: 'Witch',
                    cover: 'soft',
                    lockOn: true,
                    prone: false,
                    invisible: false,
                },
                {
                    id: 'b',
                    name: 'Sniper',
                    cover: 'none',
                    lockOn: false,
                    prone: true,
                    invisible: true,
                },
                {
                    id: 'c',
                    name: 'Sniper',
                    cover: 'hard',
                    lockOn: false,
                    prone: true,
                    invisible: true,
                },
            ],
        }
        expect(restoreState(saved)).toEqual(saved)
    })

    test('one bad value resets only itself', () => {
        const restored = restoreState({
            ...DEFAULT_STATE,
            licenseLevel: 40,
            tier: 2,
            lockOn: true,
        })
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

    test('targets: drops broken entries and keeps at most 3, copies included', () => {
        const restored = restoreState({
            targets: [
                { id: 'a', name: 'Ace' },
                'not an enemy',
                { id: 'x', name: '' },
                { id: 'b', name: 'Ace', lockOn: true },
                { id: 'c', name: 'Hive' },
                { id: 'd', name: 'Witch' },
            ],
        })
        expect(restored.targets.map((target) => target.name)).toEqual([
            'Ace',
            'Ace',
            'Hive',
        ])
    })

    test('two cards sharing an id: the later one gets a new id', () => {
        const restored = restoreState({
            targets: [
                { id: 'same', name: 'Ace' },
                { id: 'same', name: 'Hive' },
            ],
        })
        expect(restored.targets[0].id).toBe('same')
        expect(restored.targets[1].id).not.toBe('same')
    })

    test("a target's missing or broken effects fall back to none and off, and it gets an id", () => {
        const restored = restoreState({
            targets: [{ name: 'Ace', cover: 'diagonal', lockOn: 'yes' }],
        })
        expect(restored.targets).toEqual([
            {
                id: expect.any(String),
                name: 'Ace',
                cover: 'none',
                lockOn: false,
                prone: false,
                invisible: false,
            },
        ])
    })

    test('a save from the single-enemy design becomes one target with its effects', () => {
        const restored = restoreState({
            featured: 'Sniper',
            cover: 'hard',
            lockOn: true,
        })
        expect(restored.targets).toEqual([
            {
                id: expect.any(String),
                name: 'Sniper',
                cover: 'hard',
                lockOn: true,
                prone: false,
                invisible: false,
            },
        ])
    })
})

describe('newTarget', () => {
    test('a new enemy starts with none of its own effects', () => {
        expect(newTarget('Ace')).toEqual({
            id: expect.any(String),
            name: 'Ace',
            cover: 'none',
            lockOn: false,
            prone: false,
            invisible: false,
        })
    })

    test('a duplicate copies the effects but gets its own id', () => {
        const original = newTarget('Ace', {
            cover: 'hard',
            lockOn: true,
            prone: false,
            invisible: true,
        })
        const copy = newTarget(original.name, original)
        expect(copy).toEqual({ ...original, id: expect.any(String) })
        expect(copy.id).not.toBe(original.id)
    })
})
