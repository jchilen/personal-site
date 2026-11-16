import { cn } from 'cn'
import { choiceItemClass, lockedClass } from '@/components/field-styles'
import { Toggle } from '@/components/ui/toggle'
import { Hint } from '@/components/hint'

type EffectToggleProps = {
    label: string
    // A second, smaller line under the label, such as what the effect adds: "+1 Armor"
    detail?: string
    pressed: boolean
    onChange: (pressed: boolean) => void
    // Why the effect doesn't apply right now. Setting it locks the toggle (faded, striped,
    // unchangeable) and shows the reason as its tooltip
    lockedReason?: string
}

// An on/off effect, styled like the other choices
export function EffectToggle({
    label,
    detail,
    pressed,
    onChange,
    lockedReason,
}: EffectToggleProps) {
    const locked = lockedReason !== undefined

    return (
        <Hint label={lockedReason ?? null}>
            <Toggle
                pressed={pressed}
                // A locked toggle can't change, so clicks (and Space or Enter) are ignored
                onPressedChange={(next) => {
                    if (!locked) onChange(next)
                }}
                aria-disabled={locked}
                className={cn(
                    choiceItemClass,
                    'px-3',
                    // With a detail line it grows to two rows, both lined up on the left
                    detail &&
                        'h-auto flex-col items-start gap-0.5 py-2 text-left',
                    // Hovering a selected toggle softens its gold, a hint that clicking turns it off
                    locked
                        ? lockedClass
                        : 'text-foreground/80 data-[state=on]:hover:border-primary/60 data-[state=on]:hover:bg-primary/5',
                )}
            >
                {detail ? (
                    <>
                        <span>{label}</span>
                        <span className="font-normal tracking-normal normal-case">
                            {detail}
                        </span>
                    </>
                ) : (
                    label
                )}
            </Toggle>
        </Hint>
    )
}
