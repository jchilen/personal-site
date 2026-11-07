import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { SectionTitle } from '@/components/section-title'
import { Button } from '@/components/ui/button'
import { focusOnMount } from '@/lib/focus'

type PollMessageProps = {
    title: string
    // Moves focus to the title as the message appears, for when it replaces what had focus
    autoFocus?: boolean
    children: ReactNode
}

export function PollMessage({
    title,
    autoFocus = false,
    children,
}: PollMessageProps) {
    return (
        <div className="flex flex-col gap-3 border bg-card p-4">
            <SectionTitle focusRef={autoFocus ? focusOnMount : undefined}>
                {title}
            </SectionTitle>
            {children}
        </div>
    )
}

// Shown in place of the ballot or the admin controls once voting has ended
export function PollClosedMessage({ id }: { id: string }) {
    return (
        <PollMessage title="This poll has closed">
            <Button asChild className="self-start">
                <Link to={`/tools/polls/${id}/results`}>See the results</Link>
            </Button>
        </PollMessage>
    )
}
