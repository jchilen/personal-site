import type { ReactNode } from 'react'

/**
 * A game term in running text, like Heat or Lich, set in the heading font the site uses for labels
 * and stats so it stands out without looking like a link. The capitals come from CSS, so screen
 * readers still read the word as written
 */
export function GameTerm({ children }: { children: ReactNode }) {
    return (
        <strong className="font-heading text-[0.82em] font-semibold tracking-wider uppercase">
            {children}
        </strong>
    )
}
