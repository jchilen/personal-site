import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function InlineLink({ className, ...props }: ComponentProps<'a'>) {
    return (
        <a
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                'text-foreground underline decoration-primary decoration-2 underline-offset-4 dark:text-primary',
                className,
            )}
            {...props}
        />
    )
}
