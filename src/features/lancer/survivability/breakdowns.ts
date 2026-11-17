import { blasts } from './format'
import type { PilotBuild, PilotedStats } from './pilot-build'
import type { Frame } from './survivability-types'

/** A stat on the card's results that can be lit up, from the stat list or the line below the blasts */
export type ResultKey = keyof PilotedStats | 'totalHp' | 'blastDamage'

/** Which results each control changes, so hovering or focusing a control can light them up */
export const CHANGES: Record<
    | 'hull'
    | 'agility'
    | 'systems'
    | 'reinforcedFrame'
    | 'fullSubjectivitySync'
    | 'slopedPlating'
    | 'lessonOfDisbelief',
    ResultKey[]
> = {
    hull: ['hp', 'repairCap'],
    agility: ['evasion'],
    systems: ['eDefense'],
    reinforcedFrame: ['hp'],
    fullSubjectivitySync: ['evasion'],
    slopedPlating: ['armor'],
    lessonOfDisbelief: ['eDefense'],
}

/** One piece of a stat: the frame's base value, or what one part of the build adds */
export type StatPart = { amount: number; source: string }

/**
 * Where each of the card's stats comes from: the frame's base value, then whatever the build adds.
 * Parts that add nothing are left out. These follow the same rules as pilotedStats, and the tests
 * check that they always add up to it
 */
export function statParts(
    frame: Frame,
    build: PilotBuild,
): Record<keyof PilotedStats, StatPart[]> {
    const withEvasion = frame.evasion + build.agility
    // Full Subjectivity Sync stops at 20 Evasion, so it can add less than 2, or nothing
    const sync = build.fullSubjectivitySync
        ? Math.min(2, Math.max(0, 20 - withEvasion))
        : 0
    const parts = (...list: StatPart[]) =>
        list.filter((part, index) => index === 0 || part.amount !== 0)

    return {
        evasion: parts(
            { amount: frame.evasion, source: 'base' },
            { amount: build.agility, source: 'AGI' },
            { amount: sync, source: 'Full Subjectivity Sync' },
        ),
        eDefense: parts(
            { amount: frame.eDefense, source: 'base' },
            { amount: build.systems, source: 'SYS' },
            {
                amount: build.lessonOfDisbelief ? 2 : 0,
                source: 'Lesson of Disbelief',
            },
        ),
        armor: parts(
            { amount: frame.armor, source: 'base' },
            { amount: build.slopedPlating ? 1 : 0, source: 'Sloped Plating' },
        ),
        hp: parts(
            { amount: frame.hp, source: 'base' },
            { amount: 2 * build.hull, source: 'HULL' },
            {
                amount: build.reinforcedFrame ? 5 : 0,
                source: 'Reinforced Frame',
            },
        ),
        repairCap: parts(
            { amount: frame.repairCap, source: 'base' },
            { amount: Math.floor(build.hull / 2), source: 'HULL' },
        ),
    }
}

/** A stat's parts written out as a sum, like "8 base + 6 AGI + 2 Full Subjectivity Sync = 16" */
export function sumText(parts: StatPart[]): string {
    const total = parts.reduce((sum, part) => sum + part.amount, 0)
    const sum = parts.map((part) => `${part.amount} ${part.source}`).join(' + ')
    return parts.length > 1 ? `${sum} = ${total}` : sum
}

/**
 * How Total HP is worked out, like "22 HP × (4 + ⌊7 ÷ 2⌋) = 154". ⌊ ⌋ means rounded down: each
 * extra structure costs 2 Repairs, and a leftover Repair doesn't count. Frames that restore a
 * structure for 1 Repair (the Everest and its variants) need no division or rounding
 */
export function totalHpText(
    hp: number,
    repairCap: number,
    structureRepairCost: number,
    totalHp: number,
): string {
    const restored =
        structureRepairCost === 1
            ? `${repairCap}`
            : `⌊${repairCap} ÷ ${structureRepairCost}⌋`
    return `${hp} HP × (4 + ${restored}) = ${totalHp}`
}

/** How blasts to kill is worked out, like "154 Total HP ÷ 70.8 damage per blast = 2.17" */
export function blastsText(
    totalHp: number,
    blastDamage: number,
    blastsToKill: number,
): string {
    return `${totalHp} Total HP ÷ ${blastDamage.toFixed(1)} damage per blast = ${blasts(blastsToKill)}`
}
