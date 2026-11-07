import type { ReactNode, RefCallback } from 'react'

type SectionTitleProps = {
    children: ReactNode
    // Which element to render; defaults to h2. Nested headings use h3; inside a button, use span
    as?: 'h2' | 'h3' | 'span'
    // The section's place on the page, shown as "01", "02"... in place of the slash
    number?: number
    // Lets code move focus to the title, for when the content around it is swapped in. Pass
    // focusOnMount to focus it as it appears, or a ref callback to hold on to it
    focusRef?: RefCallback<HTMLElement>
    // For a control named by this title, through aria-labelledby
    id?: string
}

export function SectionTitle({
    children,
    as: Heading = 'h2',
    number,
    focusRef,
    id,
}: SectionTitleProps) {
    return (
        // A focused title gets no outline: it isn't a control, it only marks where you are.
        // tabIndex -1 lets code focus it without adding it to the Tab order
        <Heading
            id={id}
            ref={focusRef}
            tabIndex={focusRef ? -1 : undefined}
            className="flex items-center gap-2 font-heading text-sm font-semibold tracking-eyebrow text-foreground uppercase outline-none"
        >
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
