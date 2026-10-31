import { cn } from 'cn'
import { ToolLayout } from '@/components/tool-layout'
import { useApi } from '@/hooks/use-api'
import type { MyPollsResponse } from './api-types'
import { YourPolls } from './your-polls'

export function PollsPage() {
    const { state } = useApi<MyPollsResponse>('/api/polls/mine')
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
                    <div className="border bg-card p-4 text-muted-foreground">
                        The create form goes here next step.
                    </div>
                    {hasPolls && <YourPolls polls={polls} />}
                </div>
            )}
        </ToolLayout>
    )
}
