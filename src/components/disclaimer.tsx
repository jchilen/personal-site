import type { ReactNode } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'

/** A boxed note with a striped "Disclaimer" header, for the start of a methodology */
export function Disclaimer({ children }: { children: ReactNode }) {
    return (
        <div role="note" className="border border-cat-tools">
            <p className="flex items-center gap-1.5 bg-cat-tools bg-[repeating-linear-gradient(135deg,transparent_0_8px,rgb(0_0_0/0.15)_8px_16px)] px-3 py-1 font-heading text-xs font-semibold tracking-eyebrow text-background uppercase">
                <IconAlertTriangle aria-hidden="true" className="size-3.5" />
                Disclaimer
            </p>
            <p className="px-3 py-2.5">{children}</p>
        </div>
    )
}
