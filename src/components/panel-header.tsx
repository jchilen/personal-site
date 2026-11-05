import { CardHeader } from '@/components/ui/card'
import { SectionTitle } from '@/components/section-title'

type PanelHeaderProps = {
    label: string
    // The panel's place on the page, shown as "01", "02"...
    number: number
}

/** A card's header row: its numbered title, above a dividing line */
export function PanelHeader({ label, number }: PanelHeaderProps) {
    return (
        <CardHeader className="border-b">
            <SectionTitle number={number}>{label}</SectionTitle>
        </CardHeader>
    )
}
