import type { Dispatch } from 'react'
import type { Tier } from '../rules'
import type { Ruleset } from '../rulesets'
import type { PageAction } from './page-reducer'
import type { PilotBuild } from './pilot-build'

export const MAX_CARDS = 3

/**
 * The longest name a card can be given. Short enough that a name of wide capitals (all Ws) still
 * fits beside the card's buttons on a desktop screen, rather than pushing them onto their own row
 */
export const MAX_NAME_LENGTH = 24

/** The range of each pilot stat's stepper, shared by the controls, the reducer and restoreState */
export const STAT_LIMITS = {
    hull: { min: 0, max: 6 },
    agility: { min: 0, max: 6 },
    systems: { min: 0, max: 6 },
} as const

export type PilotStat = keyof typeof STAT_LIMITS

/**
 * One build card: a frame, the pilot flying it, and the enemies it faces. The same frame can be
 * on more than one card, so each card has its own id to tell them apart
 */
export type BuildCard = PilotBuild & {
    id: string
    frame: string
    /** Starts as Frame-1, Frame-2..., and can be renamed */
    name: string
    ruleset: Ruleset
    tier: Tier
    /** Folded down to its top rows. The featured (first) card is never collapsed */
    collapsed: boolean
}

/** Everything a card's controls can change */
export type CardSettings = Omit<
    BuildCard,
    'id' | 'frame' | 'name' | 'collapsed'
>

/** Everything the page remembers between visits */
export type PageState = {
    /** In order down the page. The first card is the featured one */
    cards: BuildCard[]
    /** The card shown head to head with the featured card. Never the featured card itself */
    comparingId: string | null
}

/** Props for any part of the page that shows the cards and can change them */
export type StateProps = {
    state: PageState
    dispatch: Dispatch<PageAction>
}

export const DEFAULT_SETTINGS: CardSettings = {
    ruleset: 'original',
    tier: 1,
    hull: 0,
    agility: 0,
    systems: 0,
    reinforcedFrame: false,
    fullSubjectivitySync: false,
    slopedPlating: false,
    lessonOfDisbelief: false,
    cover: 'none',
}

export const DEFAULT_STATE: PageState = { cards: [], comparingId: null }

/*
 * What a first visit shows, so the page doesn't open empty: one Everest card with no build. Its id
 * is fixed rather than random, since this is a single known card
 */
export const STARTING_STATE: PageState = {
    cards: [
        {
            ...DEFAULT_SETTINGS,
            id: 'starting-everest',
            frame: 'Everest',
            name: 'Everest-1',
            collapsed: false,
        },
    ],
    comparingId: null,
}

/**
 * The first free default name for a new card of this frame: Arminius-1, then Arminius-2, and so
 * on. A number freed up by removing or renaming a card gets used again
 */
export function nextCardName(frame: string, cards: BuildCard[]): string {
    const taken = new Set(cards.map((card) => card.name))
    let number = 1
    while (taken.has(`${frame}-${number}`)) number++
    return `${frame}-${number}`
}

/** A card's (or saved build's) settings on their own, for copying onto another card */
export function cardSettings(card: CardSettings): CardSettings {
    return {
        ruleset: card.ruleset,
        tier: card.tier,
        hull: card.hull,
        agility: card.agility,
        systems: card.systems,
        reinforcedFrame: card.reinforcedFrame,
        fullSubjectivitySync: card.fullSubjectivitySync,
        slopedPlating: card.slopedPlating,
        lessonOfDisbelief: card.lessonOfDisbelief,
        cover: card.cover,
    }
}

/** A new card for this frame, named so it doesn't clash with the cards already there */
export function newCard(
    frame: string,
    cards: BuildCard[],
    settings: CardSettings = DEFAULT_SETTINGS,
): BuildCard {
    return {
        ...settings,
        id: crypto.randomUUID(),
        frame,
        name: nextCardName(frame, cards),
        // New cards and copies start open
        collapsed: false,
    }
}

/** A pilot stat kept to its stepper's range and to whole numbers */
export function clampStat(stat: PilotStat, value: number): number {
    const { min, max } = STAT_LIMITS[stat]
    return Math.min(max, Math.max(min, Math.round(value)))
}
