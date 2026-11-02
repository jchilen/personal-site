import type { ReactNode } from 'react'

type SectionTitleProps = {
    children: ReactNode
    // Which heading level to render; defaults to h2. Headings nested under another h2 use h3
    as?: 'h2' | 'h3'
}

export function SectionTitle({
    children,
    as: Heading = 'h2',
}: SectionTitleProps) {
    return (
        <Heading className="flex items-center gap-2 font-heading text-sm font-semibold tracking-eyebrow text-foreground uppercase before:h-0.5 before:w-3.5 before:shrink-0 before:bg-cat-tools">
            {children}
        </Heading>
    )
}
