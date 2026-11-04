import type { ReactNode } from 'react'

type SectionTitleProps = {
    children: ReactNode
    // Which element to render; defaults to h2. Nested headings use h3; inside a button, use span
    as?: 'h2' | 'h3' | 'span'
    // The section's place on the page, shown as "01", "02"... in place of the marker
    number?: number
    // The small mark before the title. The rest of the site uses the dash; the slash replaces it later
    marker?: 'dash' | 'slash'
}

export function SectionTitle({
    children,
    as: Heading = 'h2',
    number,
    marker = 'dash',
}: SectionTitleProps) {
    return (
        <Heading className="flex items-center gap-2 font-heading text-sm font-semibold tracking-eyebrow text-foreground uppercase">
            <TitleMarker number={number} marker={marker} />
            {children}
        </Heading>
    )
}

// What sits before the title: the section number if there is one, otherwise the marker.
// All three are decorative, so screen readers skip them and just read the title
function TitleMarker({
    number,
    marker,
}: Pick<SectionTitleProps, 'number' | 'marker'>) {
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
    if (marker === 'slash') {
        return (
            <span
                aria-hidden="true"
                className="font-mono tracking-normal text-primary"
            >
                //
            </span>
        )
    }
    return (
        <span
            aria-hidden="true"
            className="h-0.5 w-3.5 shrink-0 bg-cat-tools"
        />
    )
}
