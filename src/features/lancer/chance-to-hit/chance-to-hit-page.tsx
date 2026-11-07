import { useEffect } from 'react'
import { ToolLayout } from '@/components/tool-layout'
import { MethodologyLayout } from '@/components/methodology-layout'
import { useApi, type ApiState } from '@/hooks/use-api'
import { YourEffects } from './effects-cards'
import { ChanceToHitMethodology } from './chance-to-hit-methodology'
import { EnemySection } from './enemy-section'
import type { LancerNpcSets } from './npc-types'
import type { SettingsProps } from './settings'
import { SetupBar } from './setup-bar'
import { usePageState } from './use-page-state'

type EnemiesProps = SettingsProps & {
    npcs: ApiState<LancerNpcSets>
}

// The enemy sections once the NPC list arrives, or why it couldn't load
function Enemies({ npcs, settings, dispatch }: EnemiesProps) {
    // A saved card for an enemy the list no longer has (renamed or removed from the table) would
    // take up a slot without ever showing, so those cards are cleared once the list arrives
    useEffect(() => {
        if (npcs.status === 'success') {
            dispatch({ type: 'removeMissingEnemies', npcs: npcs.data })
        }
    }, [npcs, dispatch])
    if (npcs.status === 'loading') return null

    if (npcs.status === 'error') {
        return (
            <p
                role="alert"
                className="border bg-card p-4 text-muted-foreground"
            >
                {npcs.error}
            </p>
        )
    }

    return (
        <EnemySection
            npcs={npcs.data[settings.ruleset]}
            settings={settings}
            dispatch={dispatch}
        />
    )
}

export function ChanceToHitPage() {
    const npcs = useApi<LancerNpcSets>('/api/lancer/npcs')
    const { state: settings, dispatch } = usePageState()

    return (
        <ToolLayout eyebrow="Lancer" title="Chance-to-Hit Calculator">
            <MethodologyLayout
                title="How the odds are worked out"
                methodology={<ChanceToHitMethodology />}
                wide
            >
                <div className="flex flex-col gap-4">
                    {/* No items-start here, so both cards stretch to the taller one's height */}
                    <div className="grid gap-4 @2xl:grid-cols-[auto_minmax(0,1fr)]">
                        <SetupBar settings={settings} dispatch={dispatch} />
                        <YourEffects settings={settings} dispatch={dispatch} />
                    </div>
                    <Enemies
                        npcs={npcs.state}
                        settings={settings}
                        dispatch={dispatch}
                    />
                </div>
            </MethodologyLayout>
        </ToolLayout>
    )
}
