import { IconAlertTriangle } from '@tabler/icons-react'

export function ChanceToHitMethodology() {
    return (
        <>
            <div role="note" className="border border-cat-tools">
                <p className="flex items-center gap-1.5 bg-cat-tools bg-[repeating-linear-gradient(135deg,transparent_0_8px,rgb(0_0_0/0.15)_8px_16px)] px-3 py-1 font-heading text-xs font-semibold tracking-eyebrow text-background uppercase">
                    <IconAlertTriangle
                        aria-hidden="true"
                        className="size-3.5"
                    />
                    Disclaimer
                </p>
                <p className="px-3 py-2.5">
                    This explanation assumes you already understand the basics
                    of Lancer combat math, such as how accuracy works.
                </p>
            </div>
            <p>
                When talking dice, we would normally treat each point of
                Accuracy as +3.5, the average roll of a d6. That works most of
                the time, but it falls apart when you reach the extremes.
            </p>
            <p>
                Say your d20 rolls a 1 against a 6 evasion target, but you have
                +1 Accuracy. In the shortcut version, this always misses because
                your roll becomes 4.5, but we know that isn't right since a 5 or
                6 still makes it hit by bringing your attack up to 6 or 7.
            </p>
            <p>
                So this calculator checks every combination instead - each
                result from 1 to 20 with each result of your Accuracy d6, 120 in
                all. Only 10 of them come up short, so you hit 110 out of 120
                times. That comes out to 91.7%, while the shortcut says 92.5%.
            </p>
            <p>
                With more than one Accuracy die you keep the highest, so the
                calculator does the same math but for every result of, say, 5d6
                instead. Against the same 6 Evasion target, 5d6 Accuracy would
                result in a 99.2% chance of hitting.
            </p>
            <p>
                Hopefully this tool helps you make better tactical decisions in
                Lancer.
            </p>
        </>
    )
}
