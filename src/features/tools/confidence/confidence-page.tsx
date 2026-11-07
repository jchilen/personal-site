import { useRef, useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { cn } from 'cn'
import { ToolLayout } from '@/components/tool-layout'
import { MethodologyLayout } from '@/components/methodology-layout'
import { Button } from '@/components/ui/button'
import { useFocusAfterRender } from '@/hooks/use-focus-after-render'
import { animateLayout } from '@/lib/animate-layout'
import {
    ConfidenceCalculator,
    type CalculatorStart,
} from './confidence-calculator'
import { ConfidenceMethodology } from './confidence-methodology'

// The first calculator's numbers, and the second's if someone compares
const STARTING_VALUES: CalculatorStart[] = [
    { dropChance: 5, confidence: 90, kills: 28, killsSoFar: 28 },
    { dropChance: 16, confidence: 95, kills: 24, killsSoFar: 24 },
]

export function ConfidencePage() {
    // Which starting values each calculator on screen uses; also its React key
    const [calculators, setCalculators] = useState([0])
    // The calculator Compare added, which takes focus as it appears, since Compare goes away
    const [addedId, setAddedId] = useState<number | null>(null)
    const focusAfterRender = useFocusAfterRender()
    const compareRef = useRef<HTMLButtonElement>(null)

    // The calculators glide to their new places as one is added or removed
    function addCalculator() {
        const added = calculators.includes(0) ? 1 : 0
        animateLayout(() => {
            setAddedId(added)
            setCalculators((current) => [...current, added])
        })
    }

    // Removing one brings Compare back, so focus goes there
    function removeCalculator(id: number) {
        focusAfterRender(() => compareRef.current)
        animateLayout(() =>
            setCalculators((current) =>
                current.filter((other) => other !== id),
            ),
        )
    }

    return (
        <ToolLayout
            eyebrow="Tools"
            title="Drop Rate Confidence"
            intro="Find out how many kills it might take, or how (un)lucky you've been so far."
        >
            <MethodologyLayout
                title="How the odds work"
                methodology={<ConfidenceMethodology />}
            >
                <div
                    className={cn(
                        'grid gap-4',
                        calculators.length > 1
                            ? '@xl:grid-cols-2'
                            : 'mx-auto w-full max-w-md',
                    )}
                >
                    {calculators.map((id) => (
                        <ConfidenceCalculator
                            key={id}
                            start={STARTING_VALUES[id]}
                            autoFocus={id === addedId}
                            onRemove={
                                calculators.length > 1
                                    ? () => removeCalculator(id)
                                    : undefined
                            }
                        />
                    ))}
                </div>

                {calculators.length < 2 && (
                    <div className="mt-4 flex justify-center">
                        <Button
                            ref={compareRef}
                            variant="framed"
                            size="sm"
                            onClick={addCalculator}
                        >
                            <IconPlus data-icon="inline-start" />
                            Compare
                        </Button>
                    </div>
                )}
            </MethodologyLayout>
        </ToolLayout>
    )
}
