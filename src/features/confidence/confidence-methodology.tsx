export function ConfidenceMethodology() {
    return (
        <>
            <p>
                Heads up, this was primarily written with World of Warcraft loot in mind.
            </p>
            <p>
                Every kill is its own separate roll, so if an item has a 5% drop
                chance, each kill has a 95% chance of missing it. Sorry pal, no
                escalating odds.
            </p>
            <p>
                When you lose the roll several times in a row, you take the miss 
                chance multiplied by itself once per kill to get the likelihood 
                of that happening. Everything else, getting at least one drop, 
                is what's left over:
            </p>
            <figure className="border bg-card px-5 py-4">
                <figcaption className="font-heading text-xs tracking-eyebrow text-muted-foreground uppercase">
                    The formula
                </figcaption>
                <p className="mt-3 text-center font-heading text-2xl font-semibold tracking-wide">
                    C = 1 − (1 − p)<sup>n</sup>
                </p>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-base">
                    <dt className="font-heading font-semibold">C</dt>
                    <dd>Chance of at least one drop</dd>
                    <dt className="font-heading font-semibold">p</dt>
                    <dd>Drop chance on a single kill</dd>
                    <dt className="font-heading font-semibold">n</dt>
                    <dd>Number of kills</dd>
                </dl>
            </figure>
            <p>
                While we default to 'Kills Needed', 'Chance After N' plugs your kills straight into that formula.
                'Kills Needed' runs it backwards. Solving for n takes a
                logarithm:
            </p>
            <figure className="border bg-card px-5 py-4">
                <figcaption className="font-heading text-xs tracking-eyebrow text-muted-foreground uppercase">
                    Solving for kills
                </figcaption>
                <div className="mt-3 flex items-center justify-center gap-3 font-heading text-2xl font-semibold tracking-wide">
                    <span>n =</span>
                    <span className="inline-flex flex-col items-center">
                        <span className="border-b-2 border-current px-2 pb-1">
                            log(1 − C)
                        </span>
                        <span className="sr-only">divided by</span>
                        <span className="px-2 pt-1">log(1 − p)</span>
                    </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                    Then round up to the next whole kill.
                </p>
            </figure>
            <p>
                Strictly speaking, this isn't a statistical confidence interval.
                That would estimate an unknown drop rate from data you've
                collected. Here the drop rate is known, and the question is how
                likely an outcome is, so "confidence" just means how sure you
                want to be.
            </p>
            <p>
                My personal worst (or best) run was 25 kills to get an item called
                Shadowcraft Spaulders, a 16% drop rate. How do your odds stack up? 
            </p>
        </>
    )
}