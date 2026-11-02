import { cn } from 'cn'
import { choiceItemClass, fieldLabelClass } from '@/components/field-styles'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Tier } from './odds'
import type { PageState } from './settings'

type ChoiceProps<T extends string> = {
    label: string
    value: T
    options: [T, string][]
    onChange: (value: T) => void
}

// A labeled row of buttons where exactly one is selected
function Choice<T extends string>({
    label,
    value,
    options,
    onChange,
}: ChoiceProps<T>) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className={fieldLabelClass}>{label}</span>
            <ToggleGroup
                type="single"
                aria-label={label}
                value={value}
                onValueChange={(next) => {
                    // Clicking the selected button again sends '', which would leave nothing selected
                    if (next) onChange(next as T)
                }}
                className="flex flex-wrap gap-2"
            >
                {options.map(([option, text]) => (
                    <ToggleGroupItem
                        key={option}
                        value={option}
                        className={cn(choiceItemClass, 'px-3')}
                    >
                        {text}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    )
}

type SetupBarProps = {
    settings: PageState
    update: (changes: Partial<PageState>) => void
}

export function SetupBar({ settings, update }: SetupBarProps) {
    return (
        <div className="flex flex-wrap gap-x-8 gap-y-4 border bg-card p-4">
            <Choice
                label="Attack"
                value={settings.attackType}
                options={[
                    ['weapon', 'Weapon'],
                    ['smart', 'Smart weapon'],
                    ['tech', 'Tech attack'],
                ]}
                onChange={(attackType) => update({ attackType })}
            />
            <Choice
                label="NPCs"
                value={settings.ruleset}
                options={[
                    ['original', 'Original'],
                    ['rebake', 'Rebake'],
                ]}
                onChange={(ruleset) => update({ ruleset })}
            />
            <Choice
                label="Tier"
                value={String(settings.tier)}
                options={[
                    ['1', 'T1'],
                    ['2', 'T2'],
                    ['3', 'T3'],
                ]}
                onChange={(tier) => update({ tier: Number(tier) as Tier })}
            />
        </div>
    )
}
