import {
    CONFIDENCE_MILESTONES,
    chanceAfter,
    formatPercent,
    killMilestones,
    killsNeeded,
} from './confidence'

/** One labeled bar under Milestones */
export type Milestone = { label: string; value: string; percent: number }

/** What the calculator shows for its current mode and inputs */
export type Summary = {
    title: string
    // The big answer and its unit, or null until the inputs can give one
    readout: { value: string; unit?: string } | null
    // The line under the answer, or a hint about what to enter
    note: string
    milestones: Milestone[]
}

/**
 * "Kills needed" mode: the fewest kills for the chosen confidence, plus milestones at set
 * confidence levels. Chances are fractions (0.05 for 5%), or null when the input isn't usable
 */
export function killsNeededSummary(
    dropChance: number | null,
    confidence: number | null,
    confidencePercent: number,
): Summary {
    // The milestones only need a drop chance, so they show even before the confidence is usable
    const milestones =
        dropChance === null
            ? []
            : CONFIDENCE_MILESTONES.map((level) => ({
                  label: `${Math.round(level * 100)}% sure`,
                  value: `${killsNeeded(dropChance, level).toLocaleString()} kills`,
                  percent: level * 100,
              }))

    if (dropChance === null || confidence === null) {
        return {
            title: 'Kills needed',
            readout: null,
            note: 'Enter a drop chance and a confidence between 0 and 100.',
            milestones,
        }
    }

    return {
        title: 'Kills needed',
        readout: {
            value: killsNeeded(dropChance, confidence).toLocaleString(),
            unit: 'kills',
        },
        note: `for at least a ${confidencePercent}% chance.`,
        milestones,
    }
}

/** "Chance after N" mode: the chance of a drop in `kills` tries, plus milestones at multiples of it */
export function chanceSummary(
    dropChance: number | null,
    kills: number,
): Summary {
    if (dropChance === null || kills < 1) {
        return {
            title: 'Chance of a drop',
            readout: null,
            note: 'Enter a drop chance and a number of kills.',
            milestones: [],
        }
    }

    return {
        title: 'Chance of a drop',
        readout: { value: formatPercent(chanceAfter(dropChance, kills)) },
        note: `of at least one drop in ${kills.toLocaleString()} kills.`,
        milestones: killMilestones(kills).map((count) => {
            const odds = chanceAfter(dropChance, count)
            return {
                label: `${count.toLocaleString()} kills`,
                value: formatPercent(odds),
                percent: odds * 100,
            }
        }),
    }
}
