import type { ReactNode } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'

type CalloutProps = {
    title: string
    children: ReactNode
}

export function Callout({ title, children }: CalloutProps) {
    return (
        <aside className="not-prose my-8 border border-l-2 border-l-primary bg-card px-5 py-4">
            <p className="flex items-center gap-2 font-heading text-xs font-semibold tracking-eyebrow text-foreground uppercase dark:text-primary">
                <IconAlertTriangle aria-hidden className="size-4" />
                {title}
            </p>
            <div className="mt-2 text-base">{children}</div>
        </aside>
    )
}