import type { Frame } from './survivability-types'

/** The base stats frames can be filtered by, in the order the filters are shown */
export const FILTER_STATS = [
    { key: 'armor', name: 'Armor' },
    { key: 'hp', name: 'HP' },
    { key: 'evasion', name: 'Evasion' },
    { key: 'eDefense', name: 'E-Defense' },
    { key: 'heatCap', name: 'Heat Cap' },
    { key: 'repairCap', name: 'Repair Cap' },
    { key: 'sensors', name: 'Sensors' },
    { key: 'techAttack', name: 'Tech Attack' },
    { key: 'saveTarget', name: 'Save Target' },
    { key: 'speed', name: 'Speed' },
    { key: 'systemPoints', name: 'System Points' },
] as const

export type FilterStat = (typeof FILTER_STATS)[number]['key']

/**
 * How a frame's stat is compared with the filter's value, in menu order, each with its name and a
 * symbol shown beside it in the menu. "any" means the filter is off
 */
export const COMPARISONS = {
    any: { name: 'Any', symbol: '∗' },
    exactly: { name: 'Exactly', symbol: '=' },
    moreThan: { name: 'More Than', symbol: '>' },
    lessThan: { name: 'Less Than', symbol: '<' },
} as const

export type Comparison = keyof typeof COMPARISONS

export type StatFilter = { comparison: Comparison; value: number }

/** One filter for every stat */
export type Filters = Record<FilterStat, StatFilter>

/** The lowest and highest value any frame has for a stat. A filter's value stays between them */
export type StatRange = { min: number; max: number }

export function statRanges(frames: Frame[]): Record<FilterStat, StatRange> {
    const ranges = {} as Record<FilterStat, StatRange>
    for (const { key } of FILTER_STATS) {
        const values = frames.map((frame) => frame[key])
        ranges[key] = { min: Math.min(...values), max: Math.max(...values) }
    }
    return ranges
}

/**
 * Every filter off ("Any"), each waiting at the average frame's value, so picking a comparison
 * starts from the middle of the field rather than one end
 */
export function defaultFilters(average: Frame): Filters {
    const filters = {} as Filters
    for (const { key } of FILTER_STATS) {
        filters[key] = { comparison: 'any', value: average[key] }
    }
    return filters
}

/** How many filters are on */
export function filtersOn(filters: Filters): number {
    return FILTER_STATS.filter(({ key }) => filters[key].comparison !== 'any')
        .length
}

function compare(stat: number, { comparison, value }: StatFilter): boolean {
    switch (comparison) {
        case 'any':
            return true
        case 'moreThan':
            return stat > value
        case 'lessThan':
            return stat < value
        case 'exactly':
            return stat === value
    }
}

/** Whether a frame's base stats meet every filter that's on */
export function meetsFilters(frame: Frame, filters: Filters): boolean {
    return FILTER_STATS.every(({ key }) => compare(frame[key], filters[key]))
}
