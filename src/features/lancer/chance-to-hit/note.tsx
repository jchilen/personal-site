import type { ReactNode } from 'react'
import { IconLock, type Icon } from '@tabler/icons-react'

type NoteProps = {
    // Defaults to the lock, for notes that explain why a control is locked
    icon?: Icon
    children: ReactNode
}

// A short note beside the controls, so a faded, unclickable button never looks broken
export function Note({ icon: NoteIcon = IconLock, children }: NoteProps) {
    return (
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <NoteIcon
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary"
            />
            {children}
        </p>
    )
}
