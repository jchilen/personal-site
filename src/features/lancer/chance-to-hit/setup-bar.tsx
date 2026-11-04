import { SectionTitle } from '@/components/section-title'
import { Choice } from './choice'
import type { Tier } from './odds'
import type { PageState } from './settings'

type SetupBarProps = {
    settings: PageState
    update: (changes: Partial<PageState>) => void
}

export function SetupBar({ settings, update }: SetupBarProps) {
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
        </section>
    )
}
