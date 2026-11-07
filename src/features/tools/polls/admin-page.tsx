import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { IconRefresh } from '@tabler/icons-react'
import { ProgressBar } from '@/components/progress-bar'
import { SectionTitle } from '@/components/section-title'
import { PollPageLayout } from './poll-page-layout'
import { Button } from '@/components/ui/button'
import { useApi, type ApiState } from '@/hooks/use-api'
import { useFocusAfterRender } from '@/hooks/use-focus-after-render'
import { errorMessage, postJson, requestJson } from '@/lib/api'
import type { PollStatus } from './api-types'
import { CopyField } from './copy-field'
import { formatCloseTime } from './format-time'
import { FormError } from './form-error'
import { PollClosedMessage, PollMessage } from './poll-message'
import { pollTitle } from './poll-title'

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
    const focusAfterRender = useFocusAfterRender()
    const confirmRef = useRef<HTMLButtonElement>(null)
    const closePollRef = useRef<HTMLButtonElement>(null)

    // Close poll and its confirm buttons swap places, so focus goes with them each way
    function startConfirming() {
        focusAfterRender(() => confirmRef.current)
        setConfirming(true)
    }

    function stopConfirming() {
        focusAfterRender(() => closePollRef.current)
        setConfirming(false)
    }

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

    if (status.closed) return <PollClosedMessage id={id} />

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
                {/* Announced when Refresh brings in new votes */}
                <p
                    aria-live="polite"
                    className="font-heading text-4xl font-semibold text-cat-tools"
                >
                    {status.ballotCount}{' '}
                    <span className="text-base tracking-widest text-muted-foreground uppercase">
                        of {status.expectedVoters} voted
                    </span>
                </p>
                <ProgressBar percent={percent} fillClass="bg-cat-tools" />
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
                    Closing ends voting and shows the results to everyone. This
                    poll will close at{' '}
                    <span className="font-semibold whitespace-nowrap text-foreground">
                        {formatCloseTime(status.expiresAt)}
                    </span>
                </p>
                <FormError message={error} />
                {confirming ? (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            ref={confirmRef}
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
                            onClick={stopConfirming}
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button
                        ref={closePollRef}
                        type="button"
                        variant="outline"
                        className="self-start"
                        onClick={startConfirming}
                    >
                        Close poll
                    </Button>
                )}
            </section>
        </div>
    )
}

type AdminContentProps = {
    id: string
    claimError: string | null
    state: ApiState<PollStatus>
    onRefresh: () => void
}

// An error if the admin link or this browser can't manage the poll, otherwise the controls
function AdminContent({ id, claimError, state, onRefresh }: AdminContentProps) {
    const errorText =
        claimError ?? (state.status === 'error' ? state.error : null)

    if (errorText) {
        return (
            <PollMessage title="Can't manage this poll">
                <p className="text-muted-foreground">{errorText}</p>
                <p className="text-sm text-muted-foreground">
                    Use the browser you created the poll in, or open the admin
                    link you saved.
                </p>
            </PollMessage>
        )
    }

    if (state.status !== 'success') return null
    return <PollManager id={id} status={state.data} onRefresh={onRefresh} />
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
        const controller = new AbortController()

        requestJson(`/api/polls/${id}/claim`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
        })
            .catch((error: unknown) => {
                if (!controller.signal.aborted)
                    setClaimError(errorMessage(error))
            })
            .finally(() => {
                if (!controller.signal.aborted)
                    navigate(pathname, { replace: true })
            })

        // Leaving the page before the claim finishes cancels it, so it can't pull you back here
        // afterward. (In development, StrictMode runs effects twice; this also drops the first run)
        return () => controller.abort()
    }, [id, token, pathname, navigate])

    // While a token is waiting to be traded in, hold off, so the status request carries the new cookie
    const { state, reload } = useApi<PollStatus>(
        token ? null : `/api/polls/${id}/status`,
    )

    return (
        <PollPageLayout
            eyebrow="Manage poll"
            title={pollTitle(state)}
            tabTitle={`Manage poll: ${pollTitle(state)}`}
            intro="Watch the votes come in, and close the poll when everyone's done."
        >
            <AdminContent
                id={id}
                claimError={claimError}
                state={state}
                onRefresh={reload}
            />
        </PollPageLayout>
    )
}
