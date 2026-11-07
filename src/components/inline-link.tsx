import type { ComponentProps } from 'react'

import { cn } from 'cn'

export function InlineLink({
    className,
    children,
    ...props
}: ComponentProps<'a'>) {
    return (
        <a
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                'text-foreground underline decoration-primary decoration-2 underline-offset-4 dark:text-primary',
                className,
            )}
            {...props}
        >
            {children}
            {/* The space sits inside the hidden text, so no underlined space shows after the link */}
            <span className="sr-only"> (opens in a new tab)</span>
        </a>
    )
}
