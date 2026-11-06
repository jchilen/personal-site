import { ToolLayout } from '@/components/tool-layout'
import { MethodologyLayout } from '@/components/methodology-layout'
import { useApi, type ApiState } from '@/hooks/use-api'
import { YourEffects } from './effects-cards'
import { ChanceToHitMethodology } from './chance-to-hit-methodology'
import { EnemySection } from './enemy-section'
import type { LancerNpcSets } from './npc-types'
import type { PageState } from './settings'
import { SetupBar } from './setup-bar'
import { usePageState } from './use-page-state'

type EnemiesProps = {
    npcs: ApiState<LancerNpcSets>
    settings: PageState
    update: (changes: Partial<PageState>) => void
}

// The enemy sections once the NPC list arrives, or why it couldn't load
function Enemies({ npcs, settings, update }: EnemiesProps) {
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
            update={update}
        />
    )
}

export function ChanceToHitPage() {
    const npcs = useApi<LancerNpcSets>('/api/lancer/npcs')
    const { state: settings, update } = usePageState()

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
                        <SetupBar settings={settings} update={update} />
                        <YourEffects settings={settings} update={update} />
                    </div>
                    <Enemies
                        npcs={npcs.state}
                        settings={settings}
                        update={update}
                    />
                </div>
            </MethodologyLayout>
        </ToolLayout>
    )
}
