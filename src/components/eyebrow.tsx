import type { ComponentProps } from 'react'
import { Slot } from 'radix-ui'
import { cn } from 'cn'

type EyebrowProps = ComponentProps<'p'> & {
    asChild?: boolean
}

export function Eyebrow({
    className,
    asChild = false,
    ...props
}: EyebrowProps) {
    const Comp = asChild ? Slot.Root : 'p'

    return (
        <Comp
            className={cn(
                'font-heading text-xs tracking-eyebrow text-muted-foreground uppercase',
                className,
            )}
            {...props}
        />
    )
}
