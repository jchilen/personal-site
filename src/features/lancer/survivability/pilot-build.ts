import type { Cover } from '../rules'
import type { Frame } from './survivability-types'

/** The pilot's choices that change how much punishment their frame can take */
export type PilotBuild = {
    /** 0 to 6 */
    hull: number
    /** 0 to 6 */
    agility: number
    /** 0 to 6 */
    systems: number
    reinforcedFrame: boolean
    fullSubjectivitySync: boolean
    slopedPlating: boolean
    lessonOfDisbelief: boolean
    cover: Cover
}

/** A frame's stats once the pilot's build is added */
export type PilotedStats = {
    evasion: number
    eDefense: number
    armor: number
    hp: number
    repairCap: number
}

// Full Subjectivity Sync can't take Evasion above this
const FULL_SUBJECTIVITY_SYNC_CAP = 20

export function pilotedStats(frame: Frame, build: PilotBuild): PilotedStats {
    const evasion = frame.evasion + build.agility
    // +2 Evasion, but only up to 20: at 19 it adds 1, and at 20 or more it adds nothing
    const sync = build.fullSubjectivitySync
        ? Math.min(2, Math.max(0, FULL_SUBJECTIVITY_SYNC_CAP - evasion))
        : 0

    return {
        evasion: evasion + sync,
        eDefense:
            frame.eDefense + build.systems + (build.lessonOfDisbelief ? 2 : 0),
        armor: frame.armor + (build.slopedPlating ? 1 : 0),
        // HULL: +2 HP per point. Reinforced Frame adds to HP, which each structure multiplies
        hp: frame.hp + 2 * build.hull + (build.reinforcedFrame ? 5 : 0),
        // HULL: +1 Repair per 2 points
        repairCap: frame.repairCap + Math.floor(build.hull / 2),
    }
}
