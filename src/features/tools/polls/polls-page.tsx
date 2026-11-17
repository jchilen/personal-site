import { useState } from 'react'
import { useLocation } from 'react-router'
import { MethodologyLayout } from '@/components/methodology-layout'
import { ToolLayout } from '@/components/tool-layout'
import { animateLayout } from '@/lib/animate-layout'
import { useApi, type ApiState } from '@/hooks/use-api'
import type {
    CreatedPoll,
    MyPoll,
    MyPollsResponse,
    VotedPoll,
    VotedPollsResponse,
} from './api-types'
import { PollList, type PollListItem } from './poll-list'
import { CreatePollForm } from './create-poll-form'
import { PollCreated } from './poll-created'
import { PollsMethodology } from './polls-methodology'

// Polls you made: open ones go to their admin page, closed ones to their results
function fromMyPoll(poll: MyPoll): PollListItem {
    return {
        id: poll.id,
        title: poll.title,
        to: `/tools/polls/${poll.id}/${poll.closed ? 'results' : 'admin'}`,
        badge: poll.closed
            ? 'Closed'
            : `${poll.ballotCount} of ${poll.expectedVoters} voted`,
        open: !poll.closed,
    }
}

// Polls you voted in: always the results page, which explains when results aren't ready yet
function fromVotedPoll(poll: VotedPoll): PollListItem {
    return {
        id: poll.id,
        title: poll.title,
        to: `/tools/polls/${poll.id}/results`,
        badge: poll.closed ? 'Closed' : 'Open',
        open: !poll.closed,
    }
}

type PollsHomeProps = {
    mine: ApiState<MyPollsResponse>
    voted: ApiState<VotedPollsResponse>
    // Called after a poll is created, so Polls you made can include it
    onCreated: () => void
}

// The create form (or the new poll's links), with the two lists beside it, even when they're empty
function PollsHome({ mine, voted, onCreated }: PollsHomeProps) {
    const [created, setCreated] = useState<CreatedPoll | null>(null)
    // Set once "Create another" brings the form back, so its question takes focus from that button
    const [cameBack, setCameBack] = useState(false)

    // Wait for both lists before laying out, so the form doesn't jump sideways when they arrive
    if (mine.status === 'loading' || voted.status === 'loading') return null

    const myPolls = mine.status === 'success' ? mine.data.polls : []
    const votedPolls = voted.status === 'success' ? voted.data.polls : []

    return (
        <div className="grid items-start gap-6 @2xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {created ? (
                <PollCreated
                    poll={created}
                    onCreateAnother={() => {
                        setCameBack(true)
                        animateLayout(() => setCreated(null))
                    }}
                />
            ) : (
                <CreatePollForm
                    autoFocus={cameBack}
                    onCreated={(poll) => {
                        // The form fades out as the new poll's links fade in
                        animateLayout(() => setCreated(poll))
                        onCreated()
                    }}
                />
            )}
            <div className="flex flex-col gap-6">
                <PollList
                    title="Polls you made"
                    items={myPolls.map(fromMyPoll)}
                />
                <PollList
                    title="Polls you voted in"
                    items={votedPolls.map(fromVotedPoll)}
                />
            </div>
        </div>
    )
}

export function PollsPage() {
    const mine = useApi<MyPollsResponse>('/api/polls/mine')
    const voted = useApi<VotedPollsResponse>('/api/polls/voted')
    const { hash } = useLocation()

    return (
        <ToolLayout
            eyebrow="Tools"
            title="Ranked Choice Poll"
            intro="Set up a ranked-choice poll to find the option most amenable to everyone."
        >
            <MethodologyLayout
                title="How the votes are counted"
                methodology={<PollsMethodology />}
                defaultOpen={hash === '#methodology'}
            >
                <PollsHome
                    mine={mine.state}
                    voted={voted.state}
                    onCreated={mine.reload}
                />
            </MethodologyLayout>
        </ToolLayout>
    )
}
