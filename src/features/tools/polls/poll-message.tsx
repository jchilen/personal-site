import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { SectionTitle } from '@/components/section-title'
import { Button } from '@/components/ui/button'

export function PollMessage({
    title,
    children,
}: {
    title: string
    children: ReactNode
}) {
    return (
        <div className="flex flex-col gap-3 border bg-card p-4">
            <SectionTitle>{title}</SectionTitle>
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
