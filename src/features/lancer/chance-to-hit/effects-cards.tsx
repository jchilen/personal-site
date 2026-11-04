import type { ReactNode } from 'react'
import { cn } from 'cn'
import { IconLock } from '@tabler/icons-react'
import { choiceItemClass, lockedClass } from '@/components/field-styles'
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
}

// A stepper with a read-only number in the middle, kept within its limits
function NumberStepper({
    label,
    name,
    value,
    limits,
    onChange,
    showSign = false,
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
        >
            <output className="w-10 text-center font-heading text-xl font-semibold tabular-nums">
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
        <section className="flex flex-col gap-3 border bg-card p-4">
            <SectionTitle number={2}>Your effects</SectionTitle>
            <NumberStepper
                label={
                    <>
                        License Level{' '}
                        <span className="text-foreground">
                            · Grit {signed(grit(settings.licenseLevel))}
                        </span>
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
                    />
                    <NumberStepper
                        label="Systems"
                        name="Systems"
                        value={settings.systems}
                        limits={LIMITS.systems}
                        onChange={(systems) => update({ systems })}
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
                <LockedNote>Engaged doesn't affect tech attacks.</LockedNote>
            )}
            <NumberStepper
                label="Other accuracy"
                name="other accuracy"
                value={settings.otherAccuracy}
                limits={LIMITS.otherAccuracy}
                onChange={(otherAccuracy) => update({ otherAccuracy })}
            />
            <NumberStepper
                label="Other difficulty"
                name="other difficulty"
                value={settings.otherDifficulty}
                limits={LIMITS.otherDifficulty}
                onChange={(otherDifficulty) => update({ otherDifficulty })}
            />
            {/* Rare, so it's dimmed to stay out of the way until someone needs it */}
            <div className="opacity-75">
                <NumberStepper
                    label={
                        <>
                            Flat bonus{' '}
                            <span className="tracking-normal normal-case">
                                (rare)
                            </span>
                        </>
                    }
                    name="flat bonus"
                    value={settings.flatBonus}
                    limits={LIMITS.flatBonus}
                    onChange={(flatBonus) => update({ flatBonus })}
                    showSign
                />
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
