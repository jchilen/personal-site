import { CardHeader } from '@/components/ui/card'
import { Eyebrow } from '@/components/eyebrow'

type PanelHeaderProps = {
    label: string
    number: string
}

export function PanelHeader({ label, number }: PanelHeaderProps) {
    return (
        <CardHeader className="border-b">
            <div className="flex justify-between">
                <Eyebrow>{label}</Eyebrow>
                <Eyebrow>{number}</Eyebrow>
            </div>
        </CardHeader>
    )
}
