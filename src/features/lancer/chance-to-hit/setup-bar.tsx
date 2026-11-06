import { SectionTitle } from '@/components/section-title'
import { Choice } from './choice'
import { IconInfoCircle } from '@tabler/icons-react'
import { Note } from './effects-cards'
import { oneOf } from '@/lib/one-of'
import { TIERS } from './odds'
import type { SettingsProps } from './settings'

export function SetupBar({ settings, update }: SettingsProps) {
    return (
        <section className="flex flex-col gap-4 border bg-card p-4">
            <SectionTitle number={1}>Setup</SectionTitle>
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
            <div className="flex flex-wrap gap-x-6 gap-y-4">
                <Choice
                    label="NPC type"
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
                    onChange={(tier) =>
                        update({
                            tier: oneOf(Number(tier), TIERS, settings.tier),
                        })
                    }
                />
            </div>
            {settings.attackType === 'tech' && (
                // w-0 min-w-full: as wide as the card, without making the card any wider
                <div className="flex w-0 min-w-full flex-col gap-1 border-t pt-3">
                    <Note>Tech attacks ignore cover.</Note>
                    <Note>Engaged doesn't affect tech attacks.</Note>
                    <Note icon={IconInfoCircle}>
                        Tech attacks can only crit with certain Frontier Foundry
                        abilities.
                    </Note>
                </div>
            )}
        </section>
    )
}
