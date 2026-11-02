import { fieldLabelClass } from '@/components/field-styles'
import { SectionTitle } from '@/components/section-title'
import { signed } from './format'
import { averageHighestD6, type Total, type attackTotals } from './odds'

type TotalCellProps = {
    name: string
    total: Total
    showSign?: boolean
}

function TotalCell({ name, total, showSign = false }: TotalCellProps) {
    return (
        <div>
            <p className={fieldLabelClass}>{name}</p>
            <p className="font-heading text-4xl font-semibold tabular-nums">
                {showSign ? signed(total.total) : total.total}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
                {total.sources.length > 0
                    ? total.sources
                          .map(
                              (source) =>
                                  `${source.label} ${source.value < 0 ? signed(source.value) : source.value}`,
                          )
                          .join(' + ')
                    : 'None'}
            </p>
        </div>
    )
}

// One sentence on what actually gets rolled once Accuracy and Difficulty cancel out
function diceSummary(net: number, accuracy: number): string {
    if (net === 0) {
        return accuracy === 0
            ? 'No accuracy or difficulty dice.'
            : 'Accuracy and difficulty cancel out, so no dice are rolled.'
    }
    const dice = Math.abs(net)
    const average = averageHighestD6(dice).toFixed(3)
    return net > 0
        ? `Roll ${dice}d6 and add the highest: +${average} on average.`
        : `Roll ${dice}d6 and subtract the highest: −${average} on average.`
}

export function TotalsCard({
    totals,
}: {
    totals: ReturnType<typeof attackTotals>
}) {
    return (
        <section aria-live="polite" className="border bg-card p-4">
            <SectionTitle>Totals</SectionTitle>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <TotalCell name="Accuracy" total={totals.accuracy} />
                <TotalCell name="Difficulty" total={totals.difficulty} />
                <TotalCell name="Attack bonus" total={totals.bonus} showSign />
            </div>
            <p className="mt-3 text-center text-sm text-muted-foreground">
                {diceSummary(totals.netAccuracy, totals.accuracy.total)}
            </p>
        </section>
    )
}
