import type { ReactNode } from 'react'

export function Part({ children }: { children: ReactNode }) {
    return (
        <span className="mb-2 block font-heading text-xs font-semibold tracking-eyebrow text-muted-foreground uppercase">
            {children}
        </span>
    )
}
