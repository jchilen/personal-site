import { useEffect, useMemo } from 'react'
import { MethodologyDialog } from '@/components/methodology-dialog'
import { ToolLayout } from '@/components/tool-layout'
import { useApi, type ApiState } from '@/hooks/use-api'
import { BuildCards } from './build-cards'
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

    return (
        <BuildCards
            state={state}
            dispatch={dispatch}
            data={survivability.data}
            standard={standard}
        />
    )
}

export function SurvivabilityPage() {
    const survivability = useApi<SurvivabilityData>('/api/lancer/survivability')
    const { state, dispatch } = usePageState()

    return (
        <ToolLayout eyebrow="Lancer" title="Frame Survivability">
            {/* In a dialog rather than a side panel, so the page's margins stay free for the versus card */}
            <div className="mb-4 flex justify-end">
                <MethodologyDialog title="How survivability is worked out">
                    <SurvivabilityMethodology />
                </MethodologyDialog>
            </div>
            <Builds
                survivability={survivability.state}
                state={state}
                dispatch={dispatch}
            />
        </ToolLayout>
    )
}
