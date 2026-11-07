import { useState } from 'react'
import { IconChevronUp } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { reducedMotionClass } from '@/components/motion-styles'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Choice } from './choice'
import type { Tier } from './odds'
import { TIER_OPTIONS, tierFromOption } from './tier-options'

type CardTierPickerProps = {
    // The card's title, so the picker's name says which card it changes
    title: string
    tier: Tier
    onChange: (tier: Tier) => void
}

/** A card's tier, as a button that opens a row of tier choices above it */
export function CardTierPicker({ title, tier, onChange }: CardTierPickerProps) {
    // Controlled here, instead of left to Radix, so picking a tier can close it
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    // Starts with the text people see, so voice control users can say it (WCAG 2.5.3)
                    aria-label={`T${tier}, change the tier for ${title}`}
                >
                    T{tier}
                    <IconChevronUp data-icon="inline-end" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                aria-label={`Tier for ${title}`}
                // With reduced motion it appears in place, without the zoom and slide in
                className={`w-auto rounded-none p-3 ${reducedMotionClass}`}
            >
                <Choice
                    label="Tier"
                    value={String(tier)}
                    options={TIER_OPTIONS}
                    onChange={(option) => {
                        onChange(tierFromOption(option, tier))
                        setOpen(false)
                    }}
                />
            </PopoverContent>
        </Popover>
    )
}
