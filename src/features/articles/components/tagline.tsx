import type { ReactNode } from 'react'

export function Tagline({ children }: { children: ReactNode }) {
    return (
        <p className="not-prose -mt-2 mb-6 font-heading text-sm tracking-widest text-muted-foreground uppercase">
            {children}
        </p>
    )
}