import { cn } from 'cn'
import { Card, CardContent } from '@/components/ui/card'
import { PanelHeader } from '@/components/panel-header'
import type { Possession, SafeLeadResult } from './safe-lead'

type Status = 'empty' | 'safe' | 'unsafe'

type SafeLeadOutputProps = {
    result: SafeLeadResult | null
    status: Status
    pointsAhead: number
    possession: Possession
    secondsLeft: number
}

const STATUS_TEXT = {
    empty: 'text-muted-foreground',
    safe: 'text-safe',
    unsafe: 'text-unsafe',
} satisfies Record<Status, string>

const STATUS_FILL = {
    empty: 'bg-muted-foreground',
    safe: 'bg-safe',
    unsafe: 'bg-unsafe',
} satisfies Record<Status, string>

type ComparisonBarProps = {
    label: string
    value: string
    percent: number
    fillClass: string
}

function ComparisonBar({
    label,
    value,
    percent,
    fillClass,
}: ComparisonBarProps) {
    return (
        <div>
            <div className="flex justify-between font-heading text-xs tracking-eyebrow text-muted-foreground uppercase">
                <span>{label}</span>
                <span className="tracking-normal text-foreground">{value}</span>
            </div>
            <div aria-hidden="true" className="mt-1.5 h-2 bg-muted">
                <div
                    className={cn(
                        'h-full transition-[width] duration-500 ease-out motion-reduce:transition-none',
                        fillClass,
                    )}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    )
}

export function SafeLeadOutput({
    result,
    status,
    pointsAhead,
    possession,
    secondsLeft,
}: SafeLeadOutputProps) {
    const longest = result ? Math.max(result.threshold, secondsLeft) : 0
    const holdsPercent =
        result && longest > 0 ? (result.threshold / longest) * 100 : 0
    const timePercent =
        result && longest > 0 ? (secondsLeft / longest) * 100 : 0

    const verdict =
        status === 'empty'
            ? 'Enter inputs'
            : status === 'safe'
              ? 'Lead is'
              : 'Not safe'
    const readout = !result
        ? '—'
        : result.isSafe
          ? 'Safe'
          : `${result.safePercent}%`

    return (
        <Card
            size="sm"
            className="border shadow-none ring-0"
            aria-live="polite"
        >
            <PanelHeader label="Output" number="02" />
            <CardContent className="flex flex-1 flex-col justify-center gap-5">
                <div>
                    <p
                        className={cn(
                            'font-heading text-xs font-semibold tracking-eyebrow uppercase',
                            STATUS_TEXT[status],
                        )}
                    >
                        {verdict}
                    </p>
                    <p className="font-heading text-4xl font-bold tracking-wider uppercase">
                        {readout}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <ComparisonBar
                        label="Lead holds for"
                        value={result ? `${result.threshold.toFixed(2)}s` : '—'}
                        percent={holdsPercent}
                        fillClass={STATUS_FILL[status]}
                    />
                    <ComparisonBar
                        label="Time left"
                        value={result ? `${secondsLeft}s` : '—'}
                        percent={timePercent}
                        fillClass="bg-muted-foreground"
                    />
                </div>

                <div className="min-h-10 font-heading text-xs leading-relaxed text-muted-foreground">
                    {result && (
                        <>
                            <p>
                                {pointsAhead} − 3{' '}
                                {possession === 'leading' ? '+' : '−'} 0.5 ={' '}
                                {result.rawValue.toFixed(1)}
                                {result.rawValue !== result.clampedValue &&
                                    ' → 0'}
                            </p>
                            <p>
                                {result.clampedValue.toFixed(1)}² ={' '}
                                {result.threshold.toFixed(2)}{' '}
                                {result.isSafe ? '>' : '≤'} {secondsLeft}s
                            </p>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
