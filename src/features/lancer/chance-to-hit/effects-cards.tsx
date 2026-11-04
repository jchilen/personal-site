import type { ReactNode } from 'react'
import { cn } from 'cn'
import { IconLock } from '@tabler/icons-react'
import {
    choiceItemClass,
    fieldLabelClass,
    lockedClass,
} from '@/components/field-styles'
import { SectionTitle } from '@/components/section-title'
import { Stepper } from '@/components/stepper'
import { Toggle } from '@/components/ui/toggle'
import { Choice } from './choice'
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
function EffectToggle({
    label,
    pressed,
    onChange,
    locked = false,
}: EffectToggleProps) {
    return (
        <Toggle
            pressed={pressed}
            onPressedChange={onChange}
            disabled={locked}
            className={cn(choiceItemClass, 'px-3', locked && lockedClass)}
        >
            {label}
        </Toggle>
    )
}

// Explains why a control is locked, so a dashed, unclickable button never looks broken
function LockedNote({ children }: { children: ReactNode }) {
    return (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <IconLock
                aria-hidden="true"
                className="size-4 shrink-0 text-primary"
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
            <SectionTitle number={2}>Your effects</SectionTitle>
            <div className="grid gap-y-3 @lg:grid-cols-2">
                <div className="flex flex-col gap-3 @lg:pr-5">
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
                    {tech && (
                        <LockedNote>
                            Engaged doesn't affect tech attacks.
                        </LockedNote>
                    )}
                </div>
                {/* The less common modifiers: smaller, and set apart by a line */}
                <div className="flex flex-col gap-2 border-t pt-3 @lg:border-t-0 @lg:border-l @lg:pt-0 @lg:pl-5">
                    <h3
                        className={cn(
                            fieldLabelClass,
                            'font-semibold text-foreground',
                        )}
                    >
                        Other effects
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

export function TargetEffects({ settings, update }: CardProps) {
    const tech = settings.attackType === 'tech'

    return (
        <section className="flex flex-col gap-3 border bg-card p-4">
            <SectionTitle marker="hex">Your target's effects</SectionTitle>
            <Choice
                label="Cover"
                value={tech ? 'none' : settings.cover}
                options={[
                    ['none', 'None'],
                    ['soft', 'Soft'],
                    ['hard', 'Hard'],
                ]}
                onChange={(cover) => update({ cover })}
                locked={tech}
            />
            {tech && <LockedNote>Tech attacks ignore cover.</LockedNote>}
            <div className="flex flex-wrap gap-2">
                <EffectToggle
                    label="Lock On"
                    pressed={settings.lockOn}
                    onChange={(lockOn) => update({ lockOn })}
                />
                <EffectToggle
                    label="Prone"
                    pressed={settings.prone}
                    onChange={(prone) => update({ prone })}
                />
                <EffectToggle
                    label="Invisible"
                    pressed={settings.invisible}
                    onChange={(invisible) => update({ invisible })}
                />
            </div>
        </section>
    )
}
