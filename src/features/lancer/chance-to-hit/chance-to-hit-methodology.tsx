import { Disclaimer } from '@/components/disclaimer'

export function ChanceToHitMethodology() {
    return (
        <>
            <Disclaimer>
                This explanation assumes you already understand the basics of
                Lancer combat math, such as how accuracy works.
            </Disclaimer>
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
