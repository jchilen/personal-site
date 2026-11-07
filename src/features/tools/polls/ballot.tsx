import { useRef, useState, type RefCallback } from 'react'
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'
import { SectionTitle } from '@/components/section-title'
import { glideClass } from '@/components/motion-styles'
import { ariaDisabledClass } from '@/components/field-styles'
import { Button } from '@/components/ui/button'
import { useFocusAfterRender } from '@/hooks/use-focus-after-render'
import { animateLayout } from '@/lib/animate-layout'
import { errorMessage, postJson } from '@/lib/api'
import { neighborAfterRemoval } from '@/lib/focus'
import { shuffle } from '@/lib/random'
import type { PollInfo } from './api-types'
import { FormError } from './form-error'

type BallotProps = {
    poll: PollInfo
    onVoted: () => void
}

// The ballot's buttons, by what they do, so focus can follow an option from one list to the other
type ButtonKind = 'pick' | 'unpick' | 'up' | 'down'

export function Ballot({ poll, onVoted }: BallotProps) {
    // Shuffled once when the ballot appears, so no option gets an edge from always being listed first
    const [shuffled] = useState(() => shuffle(poll.options))
    const [ranked, setRanked] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const focusAfterRender = useFocusAfterRender()
    const buttons = useRef(new Map<string, HTMLButtonElement>())
    const submitRef = useRef<HTMLButtonElement>(null)

    const unranked = shuffled.filter((option) => !ranked.includes(option))

    // Every option's buttons move or disappear as the ranking changes, so each one is kept by kind
    // and option, ready to take focus
    function buttonRef(
        kind: ButtonKind,
        option: string,
    ): RefCallback<HTMLButtonElement> {
        const key = `${kind}:${option}`
        return (node) => {
            if (node) buttons.current.set(key, node)
            else buttons.current.delete(key)
        }
    }

    function focusButton(kind: ButtonKind, option: string): void {
        focusAfterRender(() => buttons.current.get(`${kind}:${option}`))
    }

    // Each option keeps one transition name in both lists, so the browser sees it as the same
    // element and glides it from one list into the other. Option text can be anything, so the
    // name uses the option's place in the shuffled list instead
    function glideName(option: string): string {
        return `ballot-option-${shuffled.indexOf(option)}`
    }

    // Every change to the ranking glides the options into their new places. Each also moves focus,
    // since the button that was pressed leaves its list or moves with its row

    // Focus goes to the next option still to pick, or to Submit once the last one is placed
    function rank(option: string) {
        const leftAfter = unranked.length - 1
        const next = neighborAfterRemoval(unranked, unranked.indexOf(option))
        // With one option left, it's placed automatically, so nothing is left to pick
        if (next && leftAfter > 1) focusButton('pick', next)
        else focusAfterRender(() => submitRef.current)

        animateLayout(() => {
            setError(null)
            setRanked((current) => {
                const next = [...current, option]
                // When one option is left, it can only go last, so place it automatically
                const left = shuffled.filter((other) => !next.includes(other))
                return left.length === 1 ? [...next, left[0]] : next
            })
        })
    }

    // Focus goes to the next ranked option, or to the option just put back if none are left
    function unrank(index: number) {
        const next = neighborAfterRemoval(ranked, index)
        if (next) focusButton('unpick', next)
        else focusButton('pick', ranked[index])

        animateLayout(() =>
            setRanked((current) =>
                current.filter((_, position) => position !== index),
            ),
        )
    }

    // Focus stays on the same button as the row moves, unless the row reaches that end of the
    // list, where the button turns unavailable and focus switches to the other direction
    function move(index: number, direction: -1 | 1) {
        const option = ranked[index]
        const to = index + direction
        const atEnd = direction === -1 ? to === 0 : to === ranked.length - 1
        const sameWay = direction === -1 ? 'up' : 'down'
        const otherWay = direction === -1 ? 'down' : 'up'
        focusButton(atEnd ? otherWay : sameWay, option)

        animateLayout(() =>
            setRanked((current) => {
                const next = [...current]
                ;[next[index], next[index + direction]] = [
                    next[index + direction],
                    next[index],
                ]
                return next
            }),
        )
    }

    // The message slides open or closed, rather than pushing the button down in one jump
    function showError(message: string | null) {
        animateLayout(() => setError(message))
    }

    async function submit() {
        if (ranked.length < poll.options.length) {
            showError(`Rank all ${poll.options.length} options to submit.`)
            return
        }

        showError(null)
        setSubmitting(true)
        try {
            await postJson(`/api/polls/${poll.id}/ballots`, { ranking: ranked })
            onVoted()
        } catch (caught) {
            showError(errorMessage(caught))
            setSubmitting(false)
        }
    }

    return (
        <div className={`divide-y border bg-card ${glideClass}`}>
            <section className={`flex flex-col gap-2 p-4 ${glideClass}`}>
                <SectionTitle>Your ranking</SectionTitle>
                {ranked.length === 0 ? (
                    <p className="border border-dashed p-2.5 text-sm text-muted-foreground">
                        Nothing ranked yet.
                    </p>
                ) : (
                    <ol className="flex flex-col gap-2">
                        {ranked.map((option, index) => (
                            <li
                                key={option}
                                style={{
                                    viewTransitionName: glideName(option),
                                }}
                                className="flex items-center gap-1 border border-primary bg-primary/5 pr-1.5"
                            >
                                <button
                                    ref={buttonRef('unpick', option)}
                                    type="button"
                                    // Starts with the number and name it shows, for voice control (WCAG 2.5.3)
                                    aria-label={`${index + 1} ${option}, remove from your ranking`}
                                    onClick={() => unrank(index)}
                                    className="flex min-w-0 flex-1 items-center gap-3 p-2.5 text-left"
                                >
                                    <span className="flex size-6 shrink-0 items-center justify-center bg-primary font-heading text-sm text-primary-foreground">
                                        {index + 1}
                                    </span>
                                    <span className="truncate">{option}</span>
                                </button>
                                <Button
                                    ref={buttonRef('up', option)}
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Move ${option} up`}
                                    aria-disabled={index === 0}
                                    onClick={() => {
                                        if (index > 0) move(index, -1)
                                    }}
                                    className={ariaDisabledClass}
                                >
                                    <IconArrowUp />
                                </Button>
                                <Button
                                    ref={buttonRef('down', option)}
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Move ${option} down`}
                                    aria-disabled={index === ranked.length - 1}
                                    onClick={() => {
                                        if (index < ranked.length - 1)
                                            move(index, 1)
                                    }}
                                    className={ariaDisabledClass}
                                >
                                    <IconArrowDown />
                                </Button>
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            {unranked.length > 0 && (
                <section className={`flex flex-col gap-2 p-4 ${glideClass}`}>
                    <SectionTitle>Pick in order of preference</SectionTitle>
                    <ul className="flex flex-col gap-2">
                        {unranked.map((option) => (
                            <li
                                key={option}
                                style={{
                                    viewTransitionName: glideName(option),
                                }}
                            >
                                <button
                                    ref={buttonRef('pick', option)}
                                    type="button"
                                    onClick={() => rank(option)}
                                    className="flex w-full items-center gap-3 border p-2.5 text-left transition-colors hover:border-primary"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="size-6 shrink-0 border"
                                    />
                                    <span className="truncate">{option}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section className={`flex flex-col gap-3 p-4 ${glideClass}`}>
                <p className="text-sm text-muted-foreground">
                    Your favorite goes first. Select an already ranked option to
                    put it back.
                </p>
                <FormError message={error} />
                <Button
                    ref={submitRef}
                    type="button"
                    disabled={submitting}
                    onClick={() => void submit()}
                >
                    {submitting ? 'Submitting…' : 'Submit vote'}
                </Button>
            </section>
        </div>
    )
}
