import type { RefCallback } from 'react'
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'
import { cn } from 'cn'
import { lockedButtonClass } from '@/components/field-styles'
import { Hint } from '@/components/hint'
import { Button } from '@/components/ui/button'

const LOCKED_REASONS = {
    up: 'Already at the top',
    down: 'Already at the bottom',
}

type MoveButtonProps = {
    // What moves, for the button's name: "Move {itemName} up"
    itemName: string
    direction: 'up' | 'down'
    // At the top (for up) or the bottom (for down). It locks rather than hiding, so the buttons
    // beside it keep their places and focus has somewhere to stay
    atEnd: boolean
    buttonRef?: RefCallback<HTMLElement>
    onMove: () => void
    variant?: 'outline' | 'ghost'
    side?: 'top' | 'right' | 'bottom' | 'left'
}

/** An up or down arrow that moves something one place in a list, locked at either end */
export function MoveButton({
    itemName,
    direction,
    atEnd,
    buttonRef,
    onMove,
    variant = 'outline',
    side = 'top',
}: MoveButtonProps) {
    const label = `Move ${itemName} ${direction}`
    return (
        <Hint
            label={label}
            reason={atEnd ? LOCKED_REASONS[direction] : undefined}
            side={side}
        >
            <Button
                ref={buttonRef}
                type="button"
                variant={variant}
                size="icon-sm"
                aria-label={label}
                aria-disabled={atEnd}
                onClick={() => {
                    if (!atEnd) onMove()
                }}
                className={cn(atEnd && lockedButtonClass)}
            >
                {direction === 'up' ? <IconArrowUp /> : <IconArrowDown />}
            </Button>
        </Hint>
    )
}
