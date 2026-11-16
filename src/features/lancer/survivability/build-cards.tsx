import { useMemo, useRef } from 'react'
import { cn } from 'cn'
import { glideClass } from '@/components/motion-styles'
import { SectionTitle } from '@/components/section-title'
import { useFocusAfterRender } from '@/hooks/use-focus-after-render'
import { neighborAfterRemoval } from '@/lib/focus'
import { BuildCard } from './build-card'
import { cachedCardResults } from './card-results'
import { FramePicker } from './frame-picker'
import { LOCK_REASONS } from './lock-reasons'
import { MAX_CARDS, type StateProps } from './settings'
import type { Frame, SurvivabilityData } from './survivability-types'
import { VersusCard } from './versus-card'

type Control = 'name' | 'up' | 'down' | 'remove'

type BuildCardsProps = StateProps & {
    data: SurvivabilityData
    standard: Frame
}

/** Section 01: the build cards, featured card first */
export function BuildCards({
    state,
    dispatch,
    data,
    standard,
}: BuildCardsProps) {
    const { cards } = state
    const full = cards.length >= MAX_CARDS
    const focusAfterRender = useFocusAfterRender()
    const titleRef = useRef<HTMLElement | null>(null)
    // Every card's numbers, by card id. Each is worked out once and reused until that card changes
    const results = useMemo(
        () =>
            new Map(
                cards.map((card) => [
                    card.id,
                    cachedCardResults(card, data, standard),
                ]),
            ),
        [cards, data, standard],
    )
    const featured = cards.at(0)
    const compared = cards.find((card) => card.id === state.comparingId)
    const featuredResults = featured && results.get(featured.id)
    const comparedResults = compared && results.get(compared.id)

    // Each card's controls, by card id, so focus can be put back after cards move or go
    const controls = useRef(
        new Map<string, Partial<Record<Control, HTMLElement>>>(),
    )

    const controlRef =
        (id: string) => (control: Control) => (node: HTMLElement | null) => {
            const saved = controls.current.get(id) ?? {}
            if (node) saved[control] = node
            else delete saved[control]
            controls.current.set(id, saved)
        }
    const control = (id: string, ...wanted: Control[]) => {
        const saved = controls.current.get(id)
        for (const name of wanted) if (saved?.[name]) return saved[name]
        return undefined
    }

    // The removed card takes its Remove button with it, so focus moves to the next card's Remove
    // button, or the previous card's if it was last. With no cards left, it goes to the title
    function remove(id: string) {
        const index = cards.findIndex((card) => card.id === id)
        const next = neighborAfterRemoval(cards, index)
        focusAfterRender(() =>
            next ? control(next.id, 'remove') : titleRef.current,
        )
        dispatch({ type: 'removeCard', id })
    }

    // A moved card keeps focus on the same arrow. At the top or bottom that arrow is hidden, so
    // focus goes to the other one, or to the card's name when it's the only card
    function move(id: string, direction: 'up' | 'down') {
        const other = direction === 'up' ? 'down' : 'up'
        focusAfterRender(() => control(id, direction, other, 'name'))
        dispatch({ type: 'moveCard', id, direction })
    }

    // Make featured disappears once the card is on top, so focus goes to its Move down arrow
    function feature(id: string) {
        focusAfterRender(() => control(id, 'down', 'name'))
        dispatch({ type: 'featureCard', id })
    }

    return (
        <section className={cn('@container flex flex-col gap-4', glideClass)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionTitle
                    number={1}
                    focusRef={(node) => {
                        titleRef.current = node
                    }}
                >
                    Builds
                </SectionTitle>
                <div className="flex flex-wrap items-center gap-2">
                    <p
                        aria-live="polite"
                        className="text-xs text-muted-foreground"
                    >
                        {full && `${LOCK_REASONS.cardsFull}.`}
                    </p>
                    <FramePicker
                        frames={data.frames}
                        full={full}
                        onPick={(frame) => dispatch({ type: 'addCard', frame })}
                    />
                </div>
            </div>

            {cards.length === 0 ? (
                <p className="border bg-card p-4 text-muted-foreground">
                    Add a frame card to see how many blasts it survives. You can
                    have up to {MAX_CARDS}, and the top one is featured.
                </p>
            ) : (
                cards.map((card, index) => {
                    const cardResults = results.get(card.id)
                    // A card for a frame the data no longer has is cleared as the page loads
                    if (!cardResults) return null
                    // Every card sits in the same wrapper, so moving one never swaps what it's
                    // wrapped in, which would rebuild it and break its glide. The featured card's
                    // wrapper also holds the versus card
                    return (
                        <div key={card.id} className="relative grid gap-4">
                            <BuildCard
                                card={card}
                                results={cardResults}
                                featured={index === 0}
                                comparing={card.id === state.comparingId}
                                canMoveUp={index > 0}
                                canMoveDown={index < cards.length - 1}
                                full={full}
                                onChange={(changes) =>
                                    dispatch({
                                        type: 'changeCard',
                                        id: card.id,
                                        changes,
                                    })
                                }
                                onRename={(name) =>
                                    dispatch({
                                        type: 'renameCard',
                                        id: card.id,
                                        name,
                                    })
                                }
                                onFeature={() => feature(card.id)}
                                onCompare={() =>
                                    dispatch({
                                        type: 'toggleCompare',
                                        id: card.id,
                                    })
                                }
                                onMove={(direction) => move(card.id, direction)}
                                onDuplicate={() =>
                                    dispatch({
                                        type: 'duplicateCard',
                                        id: card.id,
                                    })
                                }
                                onRemove={() => remove(card.id)}
                                controlRef={controlRef(card.id)}
                            />
                            {index === 0 &&
                                compared &&
                                featuredResults &&
                                comparedResults && (
                                    // On screens wide enough, it floats in the margin to the right of the
                                    // featured card, tops lined up, so the card keeps the same width as the
                                    // rest. Narrower screens have no margin to spare, so it sits just below
                                    <div className="2xl:absolute 2xl:top-0 2xl:left-full 2xl:ml-4 2xl:w-48">
                                        <VersusCard
                                            featured={{
                                                name: card.name,
                                                results: featuredResults,
                                            }}
                                            compared={{
                                                name: compared.name,
                                                results: comparedResults,
                                            }}
                                        />
                                    </div>
                                )}
                        </div>
                    )
                })
            )}
        </section>
    )
}
