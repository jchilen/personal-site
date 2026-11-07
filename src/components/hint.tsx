import { useState, type ComponentProps, type ReactElement } from 'react'
import { Slot } from 'radix-ui'
import { cn } from 'cn'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { reducedMotionClass } from '@/components/motion-styles'

// The site's tooltip look: shadcn's chip and arrow, recolored to a card with a border, in the
// uppercase heading font used for labels. The arrow (the only svg inside) gets the card color and a
// border on its two outer edges, so it reads as part of the box
const hintClass = cn(
    'border bg-popover font-heading font-semibold tracking-wider text-foreground uppercase shadow-md',
    '[&_svg]:border-r [&_svg]:border-b [&_svg]:bg-popover [&_svg]:fill-popover',
    reducedMotionClass,
)

// Keeps tooltips near the top of the screen from opening under the sticky dock (16px down, 48px
// tall). Without room above, they flip below the control instead
const collisionPadding = { top: 72, right: 8, bottom: 8, left: 8 }

type PassThroughProps = ComponentProps<typeof Slot.Root> & {
    'data-state'?: string
}

// Hands the tooltip trigger's props on to the control, except data-state. Radix toggles and
// collapsible triggers style themselves by their own data-state (on, open), and the tooltip's
// (closed, delayed-open) would replace it
function WithoutTooltipState(props: PassThroughProps) {
    const rest = { ...props }
    delete rest['data-state']
    return <Slot.Root {...rest} />
}

type HintProps = {
    // The tooltip's text. For an icon-only button, use the same words as its aria-label. null means
    // no tooltip for now, like a reason that only applies while a control is locked
    label: string | null
    side?: 'top' | 'right' | 'bottom' | 'left'
    // One focusable control that passes its props through and forwards its ref, like Button
    children: ReactElement
}

/**
 * A tooltip for one control, shown on hover and on keyboard focus. Tooltips only add to what's on
 * the page: touch screens never show them, so anything a person needs must be available another way
 */
export function Hint({ label, side = 'top', children }: HintProps) {
    // Controlled, so a label coming and going never changes the elements rendered. A different
    // tree would remount the control, and a focused control would lose focus
    const [open, setOpen] = useState(false)

    return (
        <Tooltip open={open && label !== null} onOpenChange={setOpen}>
            <TooltipTrigger asChild>
                <WithoutTooltipState>{children}</WithoutTooltipState>
            </TooltipTrigger>
            {label !== null && (
                <TooltipContent
                    side={side}
                    sideOffset={6}
                    collisionPadding={collisionPadding}
                    className={hintClass}
                >
                    {label}
                </TooltipContent>
            )}
        </Tooltip>
    )
}
