import type { ReactNode } from 'react'
import { SectionTitle } from '@/components/section-title'

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
