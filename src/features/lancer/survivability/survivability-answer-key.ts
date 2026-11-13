import type { Cover, Tier } from '../rules'
import type { Ruleset } from '../rulesets'
import answerKeyJson from './survivability-answer-key.json'
import type { SurvivabilityData } from './survivability-types'

/*
 * The answer key: the reviewed v8 spreadsheet's results for all 63 frames on each of its six tabs,
 * with the API's data frozen as it was then, so later data fixes don't change these numbers
 */
export type AnswerKey = {
    source: string
    data: SurvivabilityData
    tabs: {
        tab: string
        ruleset: Ruleset
        tier: Tier
        /** The tab's assumption cells, which the sheet adds straight onto each frame */
        bonuses: {
            hullRepairs: number
            agilityEvasion: number
            systemsEDefense: number
            reinforcedFrameHp: number
            fullSubjectivitySyncEvasion: number
            slopedPlatingArmor: number
            lessonOfDisbeliefEDefense: number
        }
        cover: Cover
        results: {
            frame: string
            totalHp: number
            blastDamage: number
            blastsToKill: number
        }[]
    }[]
}

// JSON can't carry TypeScript types: it would read the three tiers as a list of any length, and
// 'Burn' as any string. So the shape above is stated here once, for every test that uses the key
export const answerKey = answerKeyJson as unknown as AnswerKey
