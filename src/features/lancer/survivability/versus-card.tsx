import { cn } from 'cn'
import { glideClass } from '@/components/motion-styles'
import { eyebrowClass } from '@/components/text-styles'
import type { CardResults } from './card-results'
import { blasts, rankColor, survivesComparedTo } from './format'

type Side = { name: string; results: CardResults }

// One card's name and blasts to kill, in its rank color like on the card
function Contender({ name, results }: Side) {
    return (
        <div className="flex flex-col items-center">
            <p className="max-w-full truncate font-heading text-sm font-semibold tracking-widest uppercase">
                {name}
            </p>
            <p
                className="font-heading text-4xl font-semibold tabular-nums"
                style={{ color: rankColor(results.rank, results.fieldSize) }}
            >
                {blasts(results.blastsToKill)}
            </p>
        </div>
    )
}

type VersusCardProps = {
    featured: Side
    compared: Side
}

/** The featured card head to head with another: both blasts to kill, and the difference */
export function VersusCard({ featured, compared }: VersusCardProps) {
    return (
        <aside
            aria-label={`${featured.name} versus ${compared.name}`}
            className={cn(
                'flex flex-col items-center gap-2 border bg-background p-4 text-center',
                glideClass,
            )}
        >
            <p className={eyebrowClass}>Versus</p>
            <Contender {...featured} />
            <p aria-hidden="true" className="text-xs text-muted-foreground">
                vs
            </p>
            <Contender {...compared} />
            <p aria-live="polite" className="mt-1 w-full border-t pt-3 text-sm">
                {survivesComparedTo(
                    featured.results.blastsToKill,
                    compared.results.blastsToKill,
                    compared.name,
                    featured.name,
                )}
            </p>
        </aside>
    )
}