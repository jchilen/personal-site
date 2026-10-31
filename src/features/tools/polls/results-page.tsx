import type { ReactNode } from 'react'
import { cn } from 'cn'
import { Link, useParams } from 'react-router'
import { SectionTitle } from '@/components/section-title'
import { ToolLayout } from '@/components/tool-layout'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import type { PollResultsResponse } from './api-types'
import { PollMessage } from './poll-message'
import { ResultsDetails } from './results-details'
import { winnerSummary } from './results-text'

export function ResultsPage() {
    const { id = '' } = useParams()
    const { state } = useApi<PollResultsResponse>(`/api/polls/${id}/results`)

    let content: ReactNode = null
    if (state.status === 'error') {
        content = (
            <PollMessage title="Results aren't available">
                <p className="text-muted-foreground">{state.error}</p>
                <Button asChild variant="outline" className="self-start">
                    <Link to={`/tools/polls/${id}`}>Go to the ballot</Link>
                </Button>
            </PollMessage>
        )
    } else if (state.status === 'success') {
        const { options, expectedVoters, results } = state.data
        const first = results.places.at(0)

        content = first ? (
            <div className="flex flex-col gap-4">
                <section className="border bg-card p-4">
                    <SectionTitle>Winner</SectionTitle>
                    <p className="mt-1 font-heading text-4xl font-semibold text-cat-tools">
                        {first.option}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {winnerSummary(first)} {results.ballotCount} of{' '}
                        {expectedVoters} voted.
                    </p>
                </section>

                <section className="border bg-card p-4">
                    <SectionTitle>Final ranking</SectionTitle>
                    <ol className="mt-3 flex flex-col gap-2">
                        {results.places.map((place, index) => (
                            <li
                                key={place.option}
                                className="flex items-center gap-3"
                            >
                                <span
                                    className={cn(
                                        'flex size-6 shrink-0 items-center justify-center border font-heading text-sm',
                                        index === 0
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {index + 1}
                                </span>
                                <span className="min-w-0 truncate">
                                    {place.option}
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>

                <ResultsDetails options={options} results={results} />
            </div>
        ) : (
            <PollMessage title="No votes were cast">
                <p className="text-muted-foreground">
                    This poll closed before anyone voted.
                </p>
            </PollMessage>
        )
    }

    return (
        <ToolLayout
            eyebrow="Poll results"
            title={
                state.status === 'success'
                    ? state.data.title
                    : 'Ranked Choice Poll'
            }
            intro="Every ballot counted, using Ranked Pairs."
        >
            <meta name="robots" content="noindex" />
            <div className="mx-auto max-w-md">{content}</div>
        </ToolLayout>
    )
}
