import type { Frame } from './survivability-types'

/**
 * The frame every result is compared against. Each stat is the average across all frames, rounded
 * to the nearest whole number so rules that count whole points (like Repairs restoring structure)
 * still work. It resists nothing, and restores structure at the normal cost of 2 Repairs
 */
export function standardFrame(frames: Frame[]): Frame {
    if (frames.length === 0) throw new Error('There are no frames to average')
    const average = (stat: (frame: Frame) => number) =>
        Math.round(
            frames.reduce((total, frame) => total + stat(frame), 0) /
                frames.length,
        )

    return {
        name: 'Average frame',
        source: 'Average of every frame',
        roles: [],
        mounts: { worst: null, mid: null, best: null },
        efficientCore: false,
        size: average((frame) => frame.size),
        armor: average((frame) => frame.armor),
        hp: average((frame) => frame.hp),
        evasion: average((frame) => frame.evasion),
        eDefense: average((frame) => frame.eDefense),
        heatCap: average((frame) => frame.heatCap),
        repairCap: average((frame) => frame.repairCap),
        sensors: average((frame) => frame.sensors),
        techAttack: average((frame) => frame.techAttack),
        saveTarget: average((frame) => frame.saveTarget),
        speed: average((frame) => frame.speed),
        systemPoints: average((frame) => frame.systemPoints),
        structureRepairCost: 2,
        damageTraits: {},
    }
}
