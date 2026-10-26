import { InlineLink } from '@/components/inline-link'

export function SafeLeadMethodology() {
    return (
        <>
            <p>
                While the best thing to do is to read{' '}
                <InlineLink href="https://www.slate.com/articles/sports/sports_nut/2008/03/the_lead_is_safe.single.html">
                    Bill James' original article
                </InlineLink>
                , I'll restate some of it here in case that page is ever lost or
                goes down.
            </p>
            <p>
                This is a heuristic method, something practical that
                Bill James came up with by guessing at formulas and tweaking
                over time based on results. Eventually he settled on something
                he felt confident in:
            </p>
            <ol className="list-decimal space-y-2 pl-6 marker:font-heading marker:text-foreground dark:marker:text-primary">
                <li>Take the number of points one team is ahead.</li>
                <li>Subtract 3.</li>
                <li>
                    Add half a point if the leading team has the ball, or
                    subtract half a point if the trailing team has the ball.
                </li>
                <li>Square that.</li>
                <li>
                    If the result is greater than the number of seconds
                    remaining, the lead is safe.
                </li>
            </ol>
            <figure className="border bg-card px-5 py-4">
                <figcaption className="font-heading text-xs tracking-eyebrow text-muted-foreground uppercase">
                    The formula
                </figcaption>
                <p className="mt-3 text-center font-heading text-2xl font-semibold tracking-wide">
                    (L − 3 ± 0.5)<sup>2</sup> {'>'} T
                </p>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-base">
                    <dt className="font-heading font-semibold">L</dt>
                    <dd>Points the leading team is ahead</dd>
                    <dt className="font-heading font-semibold">±</dt>
                    <dd>+0.5 if the leading team has the ball, −0.5 if not</dd>
                    <dt className="font-heading font-semibold">T</dt>
                    <dd>Seconds remaining</dd>
                </dl>
                <p className="mt-3 text-sm text-muted-foreground">
                    If the part in parentheses comes out negative, treat it as
                    0.
                </p>
            </figure>
            <p>
                I would be remiss not to mention that, as Bill James points out
                in his article, his editor did find one game - out of the
                hundreds of thousands in CBB history - that violates this rule:{' '}
                <InlineLink href="https://alumni.unc.edu/news/8-points-17-seconds/">
                    North Carolina vs. Duke in 1974
                </InlineLink>
                .
            </p>
        </>
    )
}
