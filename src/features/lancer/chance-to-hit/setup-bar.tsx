import { SectionTitle } from '@/components/section-title'
import { glideClass } from '@/components/motion-styles'
import { Choice } from './choice'
import { IconInfoCircle } from '@tabler/icons-react'
import { Note } from './note'
import { currentRuleset, type SettingsProps } from './settings'
import { TIER_OPTIONS, tierFromOption } from './tier-options'

export function SetupBar({ settings, dispatch }: SettingsProps) {
    // Each ruleset remembers its own tier, so this shows and changes only the showing one's
    const { tier } = currentRuleset(settings)
    return (
        <section
            className={`flex flex-col gap-4 border bg-card p-4 ${glideClass}`}
        >
            <SectionTitle number={1}>Setup</SectionTitle>
            <Choice
                label="Attack"
                value={settings.attackType}
                options={[
                    ['weapon', 'Weapon'],
                    ['smart', 'Smart weapon'],
                    ['tech', 'Tech attack'],
                ]}
                onChange={(attackType) =>
                    dispatch({
                        type: 'changeYourSettings',
                        changes: { attackType },
                    })
                }
            />
            <div className="flex flex-wrap gap-x-6 gap-y-4">
                <Choice
                    label="NPC type"
                    value={settings.ruleset}
                    options={[
                        ['original', 'Original'],
                        ['rebake', 'Rebake'],
                    ]}
                    onChange={(ruleset) =>
                        dispatch({ type: 'switchRuleset', ruleset })
                    }
                />
                <Choice
                    label="Tier"
                    value={String(tier)}
                    options={TIER_OPTIONS}
                    onChange={(option) =>
                        dispatch({
                            type: 'setSetupTier',
                            tier: tierFromOption(option, tier),
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
