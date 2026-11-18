import {
    useState,
    type ComponentProps,
    type FocusEvent,
    type ReactElement,
} from 'react'
import { Slot } from 'radix-ui'
import { hintClass, hintCollisionPadding } from '@/components/hint-styles'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'

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

// Radix opens a tooltip whenever its control gets focus, unless a press on that same control caused
// it. But focus also arrives from code: a popover handing it back after a mouse click inside, or
// focus moving to the next card after one is removed. A tooltip popping up then, with the mouse
// somewhere else, looks like a glitch. :focus-visible is the browser's own call on whether focus came
// from the keyboard, so only then does focus open the tooltip. Radix runs this before its own focus
// handler and skips that one when preventDefault is called. It doesn't affect focus itself
function openOnlyForKeyboardFocus(event: FocusEvent<HTMLElement>): void {
    if (!event.currentTarget.matches(':focus-visible')) event.preventDefault()
}

type HintProps = {
    // The tooltip's text. For an icon-only button, use the same words as its aria-label. null means
    // no tooltip for now, like a reason that only applies while a control is locked
    label: string | null
    // Why the control is locked right now, shown in parentheses on its own line below the label,
    // so a long tooltip breaks between the two rather than partway through the label
    reason?: string
    side?: 'top' | 'right' | 'bottom' | 'left'
    // One focusable control that passes its props through and forwards its ref, like Button
    children: ReactElement
}

/**
 * A tooltip for one control, shown on hover and on keyboard focus. Tooltips only add to what's on
 * the page: touch screens never show them, so anything a person needs must be available another way
 */
export function Hint({ label, reason, side = 'top', children }: HintProps) {
    // Controlled, so a label coming and going never changes the elements rendered. A different
    // tree would remount the control, and a focused control would lose focus
    const [open, setOpen] = useState(false)

    return (
        <Tooltip open={open && label !== null} onOpenChange={setOpen}>
            <TooltipTrigger asChild onFocus={openOnlyForKeyboardFocus}>
                <WithoutTooltipState>{children}</WithoutTooltipState>
            </TooltipTrigger>
            {label !== null && (
                <TooltipContent
                    side={side}
                    sideOffset={6}
                    collisionPadding={hintCollisionPadding}
                    className={hintClass}
                >
                    {/* One wrapper, since the tooltip is a flex row and would put the reason beside
                        the label. The space stays in the text, so screen readers don't run the two
                        together, but it's dropped where the line breaks */}
                    <span>
                        {label}
                        {reason !== undefined && (
                            <>
                                {' '}
                                <span className="block">({reason})</span>
                            </>
                        )}
                    </span>
                </TooltipContent>
            )}
        </Tooltip>
    )
}
