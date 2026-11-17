import { useEffect, useMemo } from 'react'
import { ToolLayout } from '@/components/tool-layout'
import { useApi, type ApiState } from '@/hooks/use-api'
import { BuildCards } from './build-cards'
import { cachedCardResults } from './card-results'
import { FieldChart } from './field-chart'
import type { StateProps } from './settings'
import { standardFrame } from './standard-frame'
import { SurvivabilityMethodology } from './survivability-methodology'
import type { SurvivabilityData } from './survivability-types'
import { usePageState } from './use-page-state'

type BuildsProps = StateProps & {
    survivability: ApiState<SurvivabilityData>
}

// The build cards once the data arrives, or why it couldn't load
function Builds({ survivability, state, dispatch }: BuildsProps) {
    // A saved card for a frame the data no longer has (renamed or removed from the table) would
    // take up a slot without ever showing, so those cards are cleared once the data arrives
    useEffect(() => {
        if (survivability.status === 'success') {
            dispatch({
                type: 'removeMissingFrames',
                frames: survivability.data.frames.map((frame) => frame.name),
            })
        }
    }, [survivability, dispatch])
    const standard = useMemo(
        () =>
            survivability.status === 'success'
                ? standardFrame(survivability.data.frames)
                : null,
        [survivability],
    )

    if (survivability.status === 'loading') return null

    if (survivability.status === 'error' || standard === null) {
        return (
            <p
                role="alert"
                className="border bg-card p-4 text-muted-foreground"
            >
                {survivability.status === 'error'
                    ? survivability.error
                    : 'No frames were found.'}
            </p>
        )
    }

    const featured = state.cards.at(0)
    // Already worked out for the featured card's own results, so this just reads them back
    const featuredResults =
        featured && cachedCardResults(featured, survivability.data, standard)

    return (
        <div className="flex flex-col gap-12">
            <BuildCards
                state={state}
                dispatch={dispatch}
                data={survivability.data}
                standard={standard}
            />
            {featured && featuredResults && (
                <FieldChart
                    card={featured}
                    results={featuredResults}
                />
            )}
        </div>
    )
}

export function SurvivabilityPage() {
    const survivability = useApi<SurvivabilityData>('/api/lancer/survivability')
    const { state, dispatch } = usePageState()

    return (
        <ToolLayout
            eyebrow="Lancer"
            title="Frame Survivability"
            intro="See how tanky your Lancer build is, and compare it to others frames or builds."
        >
            {/* In a dialog rather than a side panel, so the page's margins stay free for the versus card */}
            <div className="mb-4 flex justify-end">
                <SurvivabilityMethodology />
            </div>
            <Builds
                survivability={survivability.state}
                state={state}
                dispatch={dispatch}
            />
        </ToolLayout>
    )
}
