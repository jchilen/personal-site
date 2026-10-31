import { useState } from 'react'
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'
import { SectionTitle } from '@/components/section-title'
import { Button } from '@/components/ui/button'
import { errorMessage, postJson } from '@/lib/api'
import { shuffle } from '@/lib/random'
import type { PollInfo } from './api-types'

type BallotProps = {
    poll: PollInfo
    onVoted: () => void
}

export function Ballot({ poll, onVoted }: BallotProps) {
    // Shuffled once when the ballot appears, so no option gets an edge from always being listed first
    const [shuffled] = useState(() => shuffle(poll.options))
    const [ranked, setRanked] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const unranked = shuffled.filter((option) => !ranked.includes(option))

    function rank(option: string) {
        setError(null)
        setRanked((current) => {
            const next = [...current, option]
            // When one option is left, it can only go last, so place it automatically
            const left = shuffled.filter((other) => !next.includes(other))
            return left.length === 1 ? [...next, left[0]] : next
        })
    }

    function unrank(index: number) {
        setRanked((current) =>
            current.filter((_, position) => position !== index),
        )
    }

    function move(index: number, direction: -1 | 1) {
        setRanked((current) => {
            const next = [...current]
            ;[next[index], next[index + direction]] = [
                next[index + direction],
                next[index],
            ]
            return next
        })
    }

    async function submit() {
        if (ranked.length < poll.options.length) {
            setError(`Rank all ${poll.options.length} options to submit.`)
            return
        }

        setError(null)
        setSubmitting(true)
        try {
            await postJson(`/api/polls/${poll.id}/ballots`, { ranking: ranked })
            onVoted()
        } catch (caught) {
            setError(errorMessage(caught))
            setSubmitting(false)
        }
    }

    return (
        <div className="divide-y border bg-card">
            <section className="flex flex-col gap-2 p-4">
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
                                className="flex items-center gap-1 border border-primary bg-primary/5 pr-1.5"
                            >
                                <button
                                    type="button"
                                    aria-label={`Remove ${option} from your ranking`}
                                    onClick={() => unrank(index)}
                                    className="flex min-w-0 flex-1 items-center gap-3 p-2.5 text-left"
                                >
                                    <span className="flex size-6 shrink-0 items-center justify-center bg-primary font-heading text-sm text-primary-foreground">
                                        {index + 1}
                                    </span>
                                    <span className="truncate">{option}</span>
                                </button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Move ${option} up`}
                                    disabled={index === 0}
                                    onClick={() => move(index, -1)}
                                >
                                    <IconArrowUp />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Move ${option} down`}
                                    disabled={index === ranked.length - 1}
                                    onClick={() => move(index, 1)}
                                >
                                    <IconArrowDown />
                                </Button>
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            {unranked.length > 0 && (
                <section className="flex flex-col gap-2 p-4">
                    <SectionTitle>Pick in order of preference</SectionTitle>
                    <ul className="flex flex-col gap-2">
                        {unranked.map((option) => (
                            <li key={option}>
                                <button
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

            <section className="flex flex-col gap-3 p-4">
                <p className="text-sm text-muted-foreground">
                    Your favorite goes first. Select an already ranked option 
                    to put it back.
                </p>
                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}
                <Button
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
