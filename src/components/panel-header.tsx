import { CardHeader } from '@/components/ui/card'
import { SectionTitle } from '@/components/section-title'

type PanelHeaderProps = {
    label: string
    // The panel's place on the page, shown as "01", "02"...
    number: number
    // The title's heading level; defaults to h2. Use h3 for panels inside a section with its own h2
    as?: 'h2' | 'h3'
}

/** A card's header row: its numbered title, above a dividing line */
export function PanelHeader({ label, number, as }: PanelHeaderProps) {
    return (
        <CardHeader className="border-b">
            <SectionTitle number={number} as={as}>
                {label}
            </SectionTitle>
        </CardHeader>
    )
}
