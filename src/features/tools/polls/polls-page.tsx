import { cn } from 'cn'
import { useState } from 'react'
import { ToolLayout } from '@/components/tool-layout'
import { useApi } from '@/hooks/use-api'
import type { CreatedPoll, MyPollsResponse } from './api-types'
import { YourPolls } from './your-polls'
import { CreatePollForm } from './create-poll-form'
import { PollCreated } from './poll-created'

export function PollsPage() {
    const { state, reload } = useApi<MyPollsResponse>('/api/polls/mine')
    const [created, setCreated] = useState<CreatedPoll | null>(null)
    const polls = state.status === 'success' ? state.data.polls : []
    const hasPolls = polls.length > 0

    return (
        <ToolLayout
            eyebrow="Tools"
            title="Ranked Choice Poll"
            intro="Set up a ranked-choice poll to find the option everyone can live with."
        >
            {/* Wait for the list before laying out, so the form doesn't jump sideways when it arrives */}
            {state.status !== 'loading' && (
                <div
                    className={cn(
                        'grid items-start gap-6',
                        hasPolls
                            ? 'lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]'
                            : 'mx-auto max-w-md',
                    )}
                >
                    {created ? (
                        <PollCreated
                            poll={created}
                            onCreateAnother={() => setCreated(null)}
                        />
                    ) : (
                        <CreatePollForm
                            onCreated={(poll) => {
                                setCreated(poll)
                                reload()
                            }}
                        />
                    )}
                    {hasPolls && <YourPolls polls={polls} />}
                </div>
            )}
        </ToolLayout>
    )
}
