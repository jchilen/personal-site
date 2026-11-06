import type { ReactNode } from 'react'
import { cn } from 'cn'
import { IconLock, type Icon } from '@tabler/icons-react'
import {
    choiceItemClass,
    fieldLabelClass,
    lockedClass,
} from '@/components/field-styles'
import { SectionTitle } from '@/components/section-title'
import { Stepper } from '@/components/stepper'
import { Toggle } from '@/components/ui/toggle'
import { signed } from './format'
import { grit } from './odds'
import { LIMITS, type PageState } from './settings'

type CardProps = {
    settings: PageState
    update: (changes: Partial<PageState>) => void
}

type NumberStepperProps = {
    label: ReactNode
    name: string
    value: number
    limits: { min: number; max: number }
    onChange: (value: number) => void
    showSign?: boolean
    // A smaller number, for the less common modifiers
    compact?: boolean
    after?: ReactNode
    stacked?: boolean
}

// A stepper with a read-only number in the middle, kept within its limits
function NumberStepper({
    label,
    name,
    value,
    limits,
    onChange,
    showSign = false,
    compact = false,
    after,
    stacked = false,
}: NumberStepperProps) {
    return (
        <Stepper
            label={label}
            decreaseLabel={`Lower ${name}`}
            increaseLabel={`Raise ${name}`}
            canDecrease={value > limits.min}
            canIncrease={value < limits.max}
            onDecrease={() => onChange(value - 1)}
            onIncrease={() => onChange(value + 1)}
            after={after}
            stacked={stacked}
        >
            <output
                className={cn(
                    'text-center font-heading font-semibold tabular-nums',
                    compact ? 'w-8 text-base' : 'w-10 text-xl',
                )}
            >
                {showSign ? signed(value) : value}
            </output>
        </Stepper>
    )
}

type EffectToggleProps = {
    label: string
    pressed: boolean
    onChange: (pressed: boolean) => void
    locked?: boolean
}

// An on/off effect, styled like the other choices
export function EffectToggle({
    label,
    pressed,
    onChange,
    locked = false,
}: EffectToggleProps) {
    return (
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
                // Hovering a selected toggle softens its gold, a hint that clicking turns it off
                locked
                    ? lockedClass
                    : 'text-foreground/80 data-[state=on]:hover:border-primary/60 data-[state=on]:hover:bg-primary/5',
            )}
        >
            {label}
        </Toggle>
    )
}

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

export function YourEffects({ settings, update }: CardProps) {
    const tech = settings.attackType === 'tech'

    return (
        // Its own container, so its two columns split based on this card's width, not the page's
        <section className="@container flex flex-col gap-3 border bg-card p-4">
            <div className="grid gap-y-3 @lg:grid-cols-2">
                <div className="flex flex-col gap-4 @lg:pr-5">
                    <SectionTitle number={2}>Your primary effects</SectionTitle>
                    <NumberStepper
                        label="License Level"
                        stacked
                        after={
                            <>
                                <span
                                    aria-hidden="true"
                                    className="text-muted-foreground"
                                >
                                    =
                                </span>
                                <output className="border border-primary px-2 py-1 font-heading text-xs font-semibold tracking-widest text-primary uppercase">
                                    Grit {signed(grit(settings.licenseLevel))}
                                </output>
                            </>
                        }
                        name="License Level"
                        value={settings.licenseLevel}
                        limits={LIMITS.licenseLevel}
                        onChange={(licenseLevel) => update({ licenseLevel })}
                    />
                    {tech && (
                        <>
                            <NumberStepper
                                label="Frame Tech Attack"
                                name="Frame Tech Attack"
                                value={settings.frameTechAttack}
                                limits={LIMITS.frameTechAttack}
                                onChange={(frameTechAttack) =>
                                    update({ frameTechAttack })
                                }
                                showSign
                                stacked
                            />
                            <NumberStepper
                                label="Systems"
                                name="Systems"
                                value={settings.systems}
                                limits={LIMITS.systems}
                                onChange={(systems) => update({ systems })}
                                stacked
                            />
                        </>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <span className={fieldLabelClass}>
                            Statuses and conditions
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <EffectToggle
                                label="Impaired"
                                pressed={settings.impaired}
                                onChange={(impaired) => update({ impaired })}
                            />
                            <EffectToggle
                                label="Engaged"
                                pressed={!tech && settings.engaged}
                                onChange={(engaged) => update({ engaged })}
                                locked={tech}
                            />
                        </div>
                    </div>
                </div>
                {/* The less common modifiers: smaller, and set apart by a line */}
                <div className="flex flex-col gap-2 border-t pt-3 @lg:border-t-0 @lg:border-l @lg:pt-0 @lg:pl-5">
                    <h3
                        className={cn(
                            fieldLabelClass,
                            'leading-5 font-semibold text-foreground',
                        )}
                    >
                        Your other effects
                    </h3>
                    <NumberStepper
                        label="accuracy"
                        name="accuracy"
                        value={settings.otherAccuracy}
                        limits={LIMITS.otherAccuracy}
                        onChange={(otherAccuracy) => update({ otherAccuracy })}
                        compact
                    />
                    <NumberStepper
                        label="difficulty"
                        name="difficulty"
                        value={settings.otherDifficulty}
                        limits={LIMITS.otherDifficulty}
                        onChange={(otherDifficulty) =>
                            update({ otherDifficulty })
                        }
                        compact
                    />
                    <NumberStepper
                        label="Flat bonus"
                        name="flat bonus"
                        value={settings.flatBonus}
                        limits={LIMITS.flatBonus}
                        onChange={(flatBonus) => update({ flatBonus })}
                        showSign
                        compact
                    />
                </div>
            </div>
        </section>
    )
}
