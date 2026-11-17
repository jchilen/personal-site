import { useRef, useState, type PointerEvent } from 'react'
import { IconInfoCircle } from '@tabler/icons-react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { cn } from 'cn'
import { hintClass, hintCollisionPadding } from '@/components/hint-styles'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

// How long the explanation waits after the mouse leaves before closing, so the mouse can cross the
// gap onto the explanation itself without it disappearing
const CLOSE_DELAY = 150

type InfoTipProps = {
    // The button's name for screen readers, like "About confidence"
    label: string
    // The explanation. Screen readers don't reach it here, since focus stays on the button, so give
    // the field it explains the same words through aria-describedby too
    children: string
}

/**
 * An (i) button with a short explanation, in the same look as Hint. Unlike Hint, which only adds to
 * a control that already does something, this button's whole job is the explanation, so a tap opens
 * it too, and touch screens get it. A mouse opens it by hovering and keyboard focus opens it, like
 * Hint. Escape, or tapping or clicking anywhere else, closes it
 */
export function InfoTip({ label, children }: InfoTipProps) {
    const [open, setOpen] = useState(false)
    // Whether the mouse is over the button, so a click while hovering keeps it open, rather than
    // closing the explanation the hover just opened
    const hovering = useRef(false)
    const closeTimer = useRef<number | undefined>(undefined)

    function stayOpen() {
        window.clearTimeout(closeTimer.current)
        setOpen(true)
    }

    function closeSoon() {
        window.clearTimeout(closeTimer.current)
        closeTimer.current = window.setTimeout(
            () => setOpen(false),
            CLOSE_DELAY,
        )
    }

    // Only a mouse hovers. A finger's pointer events come with the tap, which onClick handles
    const isMouse = (event: PointerEvent) => event.pointerType === 'mouse'

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={label}
                    className="text-muted-foreground hover:text-foreground"
                    onPointerEnter={(event) => {
                        if (!isMouse(event)) return
                        hovering.current = true
                        stayOpen()
                    }}
                    onPointerLeave={(event) => {
                        if (!isMouse(event)) return
                        hovering.current = false
                        closeSoon()
                    }}
                    // Like Hint, focus only opens it when it came from the keyboard
                    onFocus={(event) => {
                        if (event.currentTarget.matches(':focus-visible'))
                            stayOpen()
                    }}
                    onBlur={() => setOpen(false)}
                    // preventDefault skips Radix's own toggle, so this one decides instead
                    onClick={(event) => {
                        event.preventDefault()
                        setOpen(hovering.current || !open)
                    }}
                >
                    <IconInfoCircle className="size-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                sideOffset={6}
                collisionPadding={hintCollisionPadding}
                // Leaves focus on the button rather than moving it into the explanation
                onOpenAutoFocus={(event) => event.preventDefault()}
                onPointerEnter={(event) => isMouse(event) && stayOpen()}
                onPointerLeave={(event) => isMouse(event) && closeSoon()}
                className={cn(
                    hintClass,
                    'w-auto max-w-xs gap-0 px-3 py-1.5 text-xs',
                )}
            >
                {children}
                <PopoverPrimitive.Arrow className="size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45" />
            </PopoverContent>
        </Popover>
    )
}
