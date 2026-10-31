import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { IconRefresh } from '@tabler/icons-react'
import { SectionTitle } from '@/components/section-title'
import { PollPageLayout } from './poll-page-layout'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import { errorMessage, postJson, requestJson } from '@/lib/api'
import type { PollStatus } from './api-types'
import { CopyField } from './copy-field'
import { PollMessage } from './poll-message'

type PollManagerProps = {
    id: string
    status: PollStatus
    onRefresh: () => void
}

function PollManager({ id, status, onRefresh }: PollManagerProps) {
    const navigate = useNavigate()
    const [confirming, setConfirming] = useState(false)
    const [closing, setClosing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // More votes than expected still fill the bar only to the end
    const percent = Math.min(
        100,
        (status.ballotCount / status.expectedVoters) * 100,
    )

    async function close() {
        setClosing(true)
        try {
            await postJson(`/api/polls/${id}/close`, {})
            navigate(`/tools/polls/${id}/results`)
        } catch (caught) {
            setError(errorMessage(caught))
            setClosing(false)
        }
    }

    if (status.closed) {
        return (
            <PollMessage title="This poll has closed">
                <Button asChild className="self-start">
                    <Link to={`/tools/polls/${id}/results`}>
                        See the results
                    </Link>
                </Button>
            </PollMessage>
        )
    }

    return (
        <div className="divide-y border bg-card">
            <section className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                    <SectionTitle>Votes</SectionTitle>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRefresh}
                    >
                        <IconRefresh />
                        Refresh
                    </Button>
                </div>
                <p className="font-heading text-4xl font-semibold text-cat-tools">
                    {status.ballotCount}{' '}
                    <span className="text-base tracking-widest text-muted-foreground uppercase">
                        of {status.expectedVoters} voted
                    </span>
                </p>
                <div aria-hidden="true" className="h-2 bg-muted">
                    <div
                        className="h-full bg-cat-tools transition-[width] duration-500 ease-out motion-reduce:transition-none"
                        style={{ width: `${percent}%` }}
                    />
                </div>
                {status.ballotCount > status.expectedVoters && (
                    <p className="text-sm text-muted-foreground">
                        More votes than expected. Every one still counts.
                    </p>
                )}
            </section>

            <section className="p-4">
                <CopyField
                    label="Share with voters"
                    value={`${window.location.origin}/tools/polls/${id}`}
                />
            </section>

            <section className="flex flex-col gap-3 p-4">
                <SectionTitle>Close the poll</SectionTitle>
                <p className="text-sm text-muted-foreground">
                    Closing ends voting and shows the results to everyone. It
                    can't be undone. Polls close on their own after 7 days.
                </p>
                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}
                {confirming ? (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={closing}
                            onClick={() => void close()}
                        >
                            {closing ? 'Closing…' : 'Yes, close it'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={closing}
                            onClick={() => setConfirming(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        className="self-start"
                        onClick={() => setConfirming(true)}
                    >
                        Close poll
                    </Button>
                )}
            </section>
        </div>
    )
}

export function AdminPage() {
    const { id = '' } = useParams()
    const { pathname, hash } = useLocation()
    const navigate = useNavigate()
    const token = hash.slice(1)
    const [claimError, setClaimError] = useState<string | null>(null)

    // Arriving from the backup admin link: trade the token for this browser's admin cookie,
    // then take it out of the address bar, so it can't be copied or shared by accident
    useEffect(() => {
        if (!token) return
        requestJson(`/api/polls/${id}/claim`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        })
            .catch((error: unknown) => setClaimError(errorMessage(error)))
            .finally(() => navigate(pathname, { replace: true }))
    }, [id, token, pathname, navigate])

    // While a token is waiting to be traded in, hold off, so the status request carries the new cookie
    const { state, reload } = useApi<PollStatus>(
        token ? null : `/api/polls/${id}/status`,
    )

    const errorText =
        claimError ?? (state.status === 'error' ? state.error : null)

    let content: ReactNode = null
    if (errorText) {
        content = (
            <PollMessage title="Can't manage this poll">
                <p className="text-muted-foreground">{errorText}</p>
                <p className="text-sm text-muted-foreground">
                    Use the browser you created the poll in, or open the admin
                    link you saved.
                </p>
            </PollMessage>
        )
    } else if (state.status === 'success') {
        content = <PollManager id={id} status={state.data} onRefresh={reload} />
    }

    return (
        <PollPageLayout
            eyebrow="Manage poll"
            title={state.status === 'success' ? state.data.title : 'Ranked Choice Poll'}
            intro="Watch the votes come in, and close the poll when everyone's done."
        >
            {content}
        </PollPageLayout>
    )
}
