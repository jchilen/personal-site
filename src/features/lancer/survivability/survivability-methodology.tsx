import { Disclaimer } from '@/components/disclaimer'
import { GameTerm } from '@/components/game-term'
import { InlineLink } from '@/components/inline-link'
import {
    MethodologyDialog,
    type Chapter,
} from '@/components/methodology-dialog'
import { eyebrowClass } from '@/components/text-styles'

const CHAPTERS: Chapter[] = [
    {
        title: 'Overview',
        content: (
            <>
                <Disclaimer>
                    This explanation assumes you already understand the basics
                    of Lancer combat, such as how Armor, resistance, and
                    structure work.
                </Disclaimer>
                <p>
                    This tool started out as one of my spreadsheets, but now
                    that I'm putting it on a website, it's much easier to use...
                    understanding the methodology is a different matter (hence
                    why this methodology is so much longer than on all the other
                    pages).
                </p>
                <p>
                    Rather than pitting your frame against one enemy at a time,
                    this tool throws everything at it at once. A blast is every
                    NPC of the chosen type/tier taking a shot at you. Each NPC
                    barrages if possible, skirmishing otherwise. This includes
                    multiattacks at higher tiers.
                </p>
                <p>
                    As a note, the following classes were not included: Human,
                    MBT (since it's a special enemy from Winter Scar), and the
                    Rebake Grunts. Every NPC uses its base stats for the tier,
                    with no templates like Elite or Veteran.
                </p>
            </>
        ),
    },
    {
        title: 'Blasts to kill',
        content: (
            <>
                <p>
                    The big number on each card is how many blasts your frame
                    can tank before it is destroyed.
                </p>
                <figure className="border bg-card px-5 py-4">
                    <figcaption className={eyebrowClass}>
                        The formula
                    </figcaption>
                    <p className="mt-3 text-center font-heading text-2xl font-semibold tracking-wide">
                        B = T ÷ D
                    </p>
                    <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-base">
                        <dt className="font-heading font-semibold">B</dt>
                        <dd>Blasts to kill</dd>
                        <dt className="font-heading font-semibold">T</dt>
                        <dd>Your frame's Total HP</dd>
                        <dt className="font-heading font-semibold">D</dt>
                        <dd>Damage the average blast deals</dd>
                    </dl>
                </figure>
                <p>
                    So a frame at 1.50 makes it through the first blast and goes
                    down halfway through the second.
                </p>
                <p>
                    Keep in mind that this number is for comparing frames and
                    builds against each other, not predicting exactly how long
                    you'd last in a real fight.
                </p>
            </>
        ),
    },
    {
        title: 'Hits + Damage',
        content: (
            <>
                <p>
                    Every attack's chance to hit is worked out exactly, the same
                    way the{' '}
                    <InlineLink href="/lancer/chance-to-hit">
                        Chance-to-Hit Calculator
                    </InlineLink>{' '}
                    does it - no treating Accuracy as a flat +3.5.
                </p>
                <p>
                    Reliable might seem weird to account for at first, but it's
                    actually just the same operation as a hit, just in reverse.
                    Its damage is averaged based on hit chance, it's just that
                    instead of the base value being multiplied by your hit
                    chance, it is instead multiplied by your miss chance.
                </p>
                <figure className="border bg-card px-5 py-4">
                    <figcaption className={eyebrowClass}>
                        The formula
                    </figcaption>
                    <p className="mt-3 text-center font-heading text-2xl font-semibold tracking-wide">
                        A = M × (H × D + (1 − H) × R)
                    </p>
                    <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-base">
                        <dt className="font-heading font-semibold">A</dt>
                        <dd>One weapon's average damage</dd>
                        <dt className="font-heading font-semibold">M</dt>
                        <dd>How many times it attacks (multiattack)</dd>
                        <dt className="font-heading font-semibold">H</dt>
                        <dd>Its chance to hit</dd>
                        <dt className="font-heading font-semibold">D</dt>
                        <dd>
                            Damage on a hit, after your Armor and resistances
                        </dd>
                        <dt className="font-heading font-semibold">R</dt>
                        <dd>
                            Its Reliable damage on a miss, after your Armor, or
                            0
                        </dd>
                    </dl>
                    <p className="mt-3 text-sm text-muted-foreground">
                        A blast's damage is every weapon's A added together.
                    </p>
                </figure>
            </>
        ),
    },
    {
        title: 'Total HP',
        content: (
            <>
                <p>
                    Your frame goes through its full HP once for each of its 4
                    structure, plus once more for every 2 Repairs while any
                    leftover Repairs go to waste.
                </p>
                <figure className="border bg-card px-5 py-4">
                    <figcaption className={eyebrowClass}>
                        The formula
                    </figcaption>
                    <p className="mt-3 text-center font-heading text-2xl font-semibold tracking-wide">
                        T = HP × (4 + R ÷ 2)
                    </p>
                    <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-base">
                        <dt className="font-heading font-semibold">T</dt>
                        <dd>Total HP</dd>
                        <dt className="font-heading font-semibold">HP</dt>
                        <dd>Your frame's HP, with your build</dd>
                        <dt className="font-heading font-semibold">R</dt>
                        <dd>Your frame's Repairs, with your build</dd>
                    </dl>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Round R ÷ 2 down. A frame with 10 HP and 5 Repairs gets
                        10 × (4 + 2) = 60 Total HP.
                    </p>
                </figure>
                <p>
                    The GMS Frames' Replaceable Parts are accounted for, so they
                    gain twice as much HP per repair as the other frames.
                </p>
                <p>
                    A conceit: Repairs are counted at the cost of restoring a
                    structure (2 each) rather than at Stabilize's 1 Repair for a
                    full bar of HP, because we'd be factoring for actions during
                    combat as well as how much HP to restore. This way
                    simplifies the math a bit while also giving a realistic
                    buffer of fixing up a destroyed weapon or system with that
                    last repair.
                </p>
            </>
        ),
    },
    {
        title: 'The average frame',
        content: (
            <>
                <p>
                    Here's the baseline: The average frame takes each stat's
                    average across all the frames, rounded to the nearest whole
                    number. It has no resistances or immunities and copies your
                    build.
                </p>
                <figure className="border bg-card px-5 py-4">
                    <figcaption className={eyebrowClass}>
                        The average frame
                    </figcaption>
                    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-base">
                        <dt className="font-heading font-semibold">HP</dt>
                        <dd>8</dd>
                        <dt className="font-heading font-semibold">Armor</dt>
                        <dd>1</dd>
                        <dt className="font-heading font-semibold">Evasion</dt>
                        <dd>8</dd>
                        <dt className="font-heading font-semibold">
                            E-Defense
                        </dt>
                        <dd>8</dd>
                        <dt className="font-heading font-semibold">Repairs</dt>
                        <dd>4</dd>
                    </dl>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Before your stats come into play, that's 8 × (4 + 2) =
                        48 Total HP.
                    </p>
                </figure>
                <p>
                    That multiplier is why HP bonuses are worth more than they
                    look (and why HULL is so powerful). Reinforced Frame's +5 HP
                    is added to every bar, so on the average frame it's really 5
                    × 6 = 30 Total HP, and each point of HULL's +2 HP is 12.
                </p>
                <p>
                    Another conceit: it is possible for your mech to be
                    destroyed well before reaching 0/4 structure, but given this
                    is about averages, we'll assume you don't roll snake eyes on
                    your structure check.
                </p>
            </>
        ),
    },
    {
        title: "What's left out",
        content: (
            <>
                <p>
                    This is all about damage, so NPC traits, systems, and tech
                    attacks aren't included. Neither are weapon effects like
                    Knockback, or anything situational like what your own
                    systems might do.
                </p>
                <p>
                    <GameTerm>Heat</GameTerm> isn't accounted for, nor the
                    ongoing end-of-turn <GameTerm>Burn</GameTerm> damage after
                    the initial hit. Heat is a different axis of attack from
                    what this tool focuses on, while Burn depends too much on
                    later ENGI rolls to put a number on.
                </p>
                <p>
                    The <GameTerm>White Witch</GameTerm> also needs a special
                    mention. Its armor is too complex to map onto these rules
                    (it would require determining things like what order the
                    attacks happen in), so it's treated as 3 Armor instead of
                    the 0-6 it would realistically have during combat.
                </p>
                <p>
                    Similarly, the <GameTerm>Emperor</GameTerm> and{' '}
                    <GameTerm>Lich</GameTerm> have unique abilities that greatly
                    impact how tanky they are, so they will always rank much
                    lower here than they should, but hopefully this can still be
                    a useful tool for comparing different{' '}
                    <GameTerm>Emperor</GameTerm> builds.
                </p>
            </>
        ),
    },
]

/** The Methodology button and its chapters, for the top of the page */
export function SurvivabilityMethodology() {
    return (
        <MethodologyDialog
            title="How survivability is worked out"
            chapters={CHAPTERS}
        />
    )
}
