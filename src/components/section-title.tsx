import type { ReactNode } from 'react'

export function SectionTitle({ children }: { children: ReactNode }) {
    return (
        <h2 className="flex items-center gap-2 font-heading text-sm font-semibold tracking-eyebrow text-foreground uppercase before:h-0.5 before:w-3.5 before:shrink-0 before:bg-cat-tools">
            {children}
        </h2>
    )
}
