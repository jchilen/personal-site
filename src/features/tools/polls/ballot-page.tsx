import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { PollMessage } from './poll-message'
import { PollPageLayout } from './poll-page-layout'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import type { PollInfo } from './api-types'
import { Ballot } from './ballot'

export function BallotPage() {
    const { id = '' } = useParams()
    const { state, reload } = useApi<PollInfo>(`/api/polls/${id}`)

    let content: ReactNode = null
    if (state.status === 'error') {
        content = (
            <PollMessage title="Can't open this poll">
                <p className="text-muted-foreground">{state.error}</p>
                <Button asChild variant="outline" className="self-start">
                    <Link to="/tools/polls">Make your own poll</Link>
                </Button>
            </PollMessage>
        )
    } else if (state.status === 'success') {
        const poll = state.data
        if (poll.closed) {
            content = (
                <PollMessage title="This poll has closed">
                    <Button asChild className="self-start">
                        <Link to={`/tools/polls/${poll.id}/results`}>
                            See the results
                        </Link>
                    </Button>
                </PollMessage>
            )
        } else if (poll.hasVoted) {
            content = (
                <PollMessage title="Your vote is in">
                    <p className="text-muted-foreground">
                        Results appear here when the poll closes.
                    </p>
                </PollMessage>
            )
        } else {
            // After voting, reload asks the server again, which now answers hasVoted: true
            content = <Ballot poll={poll} onVoted={reload} />
        }
    }

    return (
        <PollPageLayout
            eyebrow="Ranked Choice Poll"
            title={state.status === 'success' ? state.data.title : 'Ranked Choice Poll'}
            intro="Rank every option, favorite first."
        >
            {content}
        </PollPageLayout>
    )
}
