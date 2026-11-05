import type { ReactNode } from 'react'

type SectionTitleProps = {
    children: ReactNode
    // Which element to render; defaults to h2. Nested headings use h3; inside a button, use span
    as?: 'h2' | 'h3' | 'span'
    // The section's place on the page, shown as "01", "02"... in place of the slash
    number?: number
}

export function SectionTitle({
    children,
    as: Heading = 'h2',
    number,
}: SectionTitleProps) {
    return (
        <Heading className="flex items-center gap-2 font-heading text-sm font-semibold tracking-eyebrow text-foreground uppercase">
            <TitleMarker number={number} />
            {children}
        </Heading>
    )
}

// The section number if there is one, otherwise a gold double slash.
// Both are decorative, so screen readers skip them and just read the title
function TitleMarker({ number }: Pick<SectionTitleProps, 'number'>) {
    if (number !== undefined) {
        return (
            <span
                aria-hidden="true"
                className="font-mono text-primary tabular-nums"
            >
                {String(number).padStart(2, '0')}
            </span>
        )
    }
    return (
        <span
            aria-hidden="true"
            className="font-mono tracking-normal text-primary"
        >
            //
        </span>
    )
}
