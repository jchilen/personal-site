import { MethodologyLayout } from '@/components/methodology-layout'
import { ToolLayout } from '@/components/tool-layout'
import { useApi, type ApiState } from '@/hooks/use-api'
import { standardFrame } from './standard-frame'
import { SurvivabilityMethodology } from './survivability-methodology'
import type { SurvivabilityData } from './survivability-types'

type BuildsProps = {
    survivability: ApiState<SurvivabilityData>
}

// The build cards once the data arrives, or why it couldn't load
function Builds({ survivability }: BuildsProps) {
    if (survivability.status === 'loading') return null

    if (survivability.status === 'error') {
        return (
            <p
                role="alert"
                className="border bg-card p-4 text-muted-foreground"
            >
                {survivability.error}
            </p>
        )
    }

    const { frames, attacks } = survivability.data
    const standard = standardFrame(frames)
    // Temporary: shows the data and math arrived, until the build cards take its place
    return (
        <p className="border bg-card p-4">
            Loaded {frames.length} frames and{' '}
            {attacks.original[0].length + attacks.rebake[0].length} Tier 1
            attackers. Standard frame: Armor {standard.armor}, HP {standard.hp},
            Evasion {standard.evasion}, E-Defense {standard.eDefense}, Repair
            Cap {standard.repairCap}.
        </p>
    )
}

export function SurvivabilityPage() {
    const survivability = useApi<SurvivabilityData>('/api/lancer/survivability')

    return (
        <ToolLayout eyebrow="Lancer" title="Frame Survivability">
            <MethodologyLayout
                title="How survivability is worked out"
                methodology={<SurvivabilityMethodology />}
                wide
            >
                <Builds survivability={survivability.state} />
            </MethodologyLayout>
        </ToolLayout>
    )
}