import { Link, useParams } from 'react-router'
import { PollClosedMessage, PollMessage } from './poll-message'
import { PollPageLayout } from './poll-page-layout'
import { Button } from '@/components/ui/button'
import { useApi, type ApiState } from '@/hooks/use-api'
import type { PollInfo } from './api-types'
import { Ballot } from './ballot'
import { pollTitle } from './poll-title'

type BallotContentProps = {
    state: ApiState<PollInfo>
    onVoted: () => void
}

// Whatever fits the poll's state: an error, a closed or already-voted message, or the ballot
function BallotContent({ state, onVoted }: BallotContentProps) {
    if (state.status === 'loading') return null

    if (state.status === 'error') {
        return (
            <PollMessage title="Can't open this poll">
                <p className="text-muted-foreground">{state.error}</p>
                <Button asChild variant="outline" className="self-start">
                    <Link to="/tools/polls">Make your own poll</Link>
                </Button>
            </PollMessage>
        )
    }

    const poll = state.data
    if (poll.closed) return <PollClosedMessage id={poll.id} />

    if (poll.hasVoted) {
        return (
            <PollMessage title="Your vote is in">
                <p className="text-muted-foreground">
                    Results appear here when the poll closes.
                </p>
            </PollMessage>
        )
    }

    // After voting, reload asks the server again, which now answers hasVoted: true
    return <Ballot poll={poll} onVoted={onVoted} />
}

export function BallotPage() {
    const { id = '' } = useParams()
    const { state, reload } = useApi<PollInfo>(`/api/polls/${id}`)

    return (
        <PollPageLayout
            eyebrow="Ranked Choice Poll"
            title={pollTitle(state)}
            intro="Rank every option, favorite first."
        >
            <BallotContent state={state} onVoted={reload} />
        </PollPageLayout>
    )
}
