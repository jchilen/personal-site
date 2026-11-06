import { cn } from 'cn'

type ProgressBarProps = {
    // 0 to 100
    percent: number
    // The fill's background, like 'bg-cat-tools'
    fillClass: string
    className?: string
}

/** A thin bar that fills to a percent, sliding smoothly when the percent changes */
export function ProgressBar({
    percent,
    fillClass,
    className,
}: ProgressBarProps) {
    return (
        // Hidden from screen readers: the number beside or above it already says the same thing
        <div aria-hidden="true" className={cn('h-2 bg-muted', className)}>
            <div
                className={cn(
                    'h-full transition-[width] duration-500 ease-out motion-reduce:transition-none',
                    fillClass,
                )}
                style={{ width: `${percent}%` }}
            />
        </div>
    )
}

type LabeledProgressBarProps = ProgressBarProps & {
    label: string
    value: string
}

/** A progress bar with its label on the left and its value on the right, above it */
export function LabeledProgressBar({
    label,
    value,
    percent,
    fillClass,
}: LabeledProgressBarProps) {
    return (
        <div>
            <div className="flex justify-between font-heading text-xs tracking-eyebrow text-muted-foreground uppercase">
                <span>{label}</span>
                <span className="tracking-normal text-foreground normal-case">
                    {value}
                </span>
            </div>
            <ProgressBar
                percent={percent}
                fillClass={fillClass}
                className="mt-1.5"
            />
        </div>
    )
}
