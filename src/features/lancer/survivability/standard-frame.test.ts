import { expect, test } from 'vitest'
import { answerKey } from './survivability-answer-key'
import { standardFrame } from './standard-frame'
import type { Frame } from './survivability-types'

const frames = answerKey.data.frames

test('each stat is the average of every frame, rounded to a whole number', () => {
    // The v8 frames average Armor 0.97, HP 7.95, Evasion 8.40, E-Defense 8.48 and Repairs 3.98
    expect(standardFrame(frames)).toMatchObject({
        armor: 1,
        hp: 8,
        evasion: 8,
        eDefense: 8,
        repairCap: 4,
    })
})

test('an average exactly halfway rounds up', () => {
    const two = [
        { ...frames[0], hp: 7 },
        { ...frames[0], hp: 8 },
    ]
    expect(standardFrame(two).hp).toBe(8)
})

test('it resists nothing and repairs structure at the normal cost, whatever the frames do', () => {
    const unusual: Frame[] = frames.map((frame) => ({
        ...frame,
        structureRepairCost: 1,
        damageTraits: { Kinetic: 'resist' },
    }))
    expect(standardFrame(unusual)).toMatchObject({
        structureRepairCost: 2,
        damageTraits: {},
    })
})

test('with no frames there is nothing to average, so it says so instead of returning NaN', () => {
    expect(() => standardFrame([])).toThrow('There are no frames to average')
})