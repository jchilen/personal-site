import { useId, type ReactNode } from 'react'
import { cn } from 'cn'
import { SectionTitle } from '@/components/section-title'
import { glideClass } from '@/components/motion-styles'
import { Stepper } from '@/components/stepper'
import { EffectToggle } from './effect-toggle'
import { signed } from './format'
import { LOCK_REASONS } from './lock-reasons'
import { grit, type YourSettings } from './odds'
import { LIMITS, type SettingsProps } from './settings'
import { eyebrowClass } from '@/components/text-styles'

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

export function YourEffects({ settings, dispatch }: SettingsProps) {
    const tech = settings.attackType === 'tech'
    const statusesId = useId()
    const change = (changes: Partial<YourSettings>) =>
        dispatch({ type: 'changeYourSettings', changes })

    return (
        // Its own container, so its two columns split based on this card's width, not the page's
        <section
            className={`@container flex flex-col gap-3 border bg-card p-4 ${glideClass}`}
        >
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
                        onChange={(licenseLevel) => change({ licenseLevel })}
                    />
                    {tech && (
                        <>
                            <NumberStepper
                                label="Frame Tech Attack"
                                name="Frame Tech Attack"
                                value={settings.frameTechAttack}
                                limits={LIMITS.frameTechAttack}
                                onChange={(frameTechAttack) =>
                                    change({ frameTechAttack })
                                }
                                showSign
                                stacked
                            />
                            <NumberStepper
                                label="Systems"
                                name="Systems"
                                value={settings.systems}
                                limits={LIMITS.systems}
                                onChange={(systems) => change({ systems })}
                                stacked
                            />
                        </>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <span id={statusesId} className={eyebrowClass}>
                            Statuses and conditions
                        </span>
                        {/* Grouped under its label, so screen readers say what the toggles are for */}
                        <div
                            role="group"
                            aria-labelledby={statusesId}
                            className="flex flex-wrap gap-2"
                        >
                            <EffectToggle
                                label="Impaired"
                                pressed={settings.impaired}
                                onChange={(impaired) => change({ impaired })}
                            />
                            <EffectToggle
                                label="Engaged"
                                pressed={!tech && settings.engaged}
                                onChange={(engaged) => change({ engaged })}
                                lockedReason={
                                    tech ? LOCK_REASONS.techEngaged : undefined
                                }
                            />
                        </div>
                    </div>
                </div>
                {/* The less common modifiers: smaller, and set apart by a line */}
                <div className="flex flex-col gap-2 border-t pt-3 @lg:border-t-0 @lg:border-l @lg:pt-0 @lg:pl-5">
                    <h3
                        className={cn(
                            eyebrowClass,
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
                        onChange={(otherAccuracy) => change({ otherAccuracy })}
                        compact
                    />
                    <NumberStepper
                        label="difficulty"
                        name="difficulty"
                        value={settings.otherDifficulty}
                        limits={LIMITS.otherDifficulty}
                        onChange={(otherDifficulty) =>
                            change({ otherDifficulty })
                        }
                        compact
                    />
                    <NumberStepper
                        label="Flat bonus"
                        name="flat bonus"
                        value={settings.flatBonus}
                        limits={LIMITS.flatBonus}
                        onChange={(flatBonus) => change({ flatBonus })}
                        showSign
                        compact
                    />
                </div>
            </div>
        </section>
    )
}
