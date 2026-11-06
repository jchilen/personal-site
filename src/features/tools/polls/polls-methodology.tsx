import { eyebrowClass } from '@/components/text-styles'

const subheadingClass =
    'font-heading text-base font-semibold tracking-eyebrow uppercase'

export function PollsMethodology() {
    return (
        <>
            <h3 className={subheadingClass}>Voting</h3>
            <p>
                Each voter ranks every option, from favorite to least favorite.
            </p>

            <h3 className={subheadingClass}>Head-to-head</h3>
            <p>
                First, every pair of options is compared. For each pair, the
                poll counts how many voters ranked one above the other. If 5
                voters put Lancer above DnD and 3 did the reverse, Lancer wins
                that matchup 5–3.
            </p>

            <h3 className={subheadingClass}>Ranked Pairs</h3>
            <p>
                Next, the head-to-head wins are sorted from strongest to weakest
                and locked in one at a time. Sometimes a group's preferences go
                in a circle: Board Game beats Movie, Movie beats Mini-Golf, and
                Mini-Golf beats Board Game. When that happens, Ranked Pairs
                breaks the circle at its weakest link, the win the fewest voters
                agreed on.
            </p>
            <figure className="border bg-card px-5 py-4 text-base">
                <figcaption className={eyebrowClass}>
                    Example: 9 voters
                </figcaption>
                <ul className="mt-3 space-y-1">
                    <li>4 voters: Board Game &gt; Movie &gt; Mini-Golf</li>
                    <li>3 voters: Movie &gt; Mini-Golf &gt; Board Game</li>
                    <li>2 voters: Mini-Golf &gt; Board Game &gt; Movie</li>
                </ul>
                <ul className="mt-3 space-y-1 border-t pt-3">
                    <li>Movie beats Mini-Golf, 7–2</li>
                    <li>Board Game beats Movie, 6–3</li>
                    <li>Mini-Golf beats Board Game, 5–4</li>
                </ul>
                <p className="mt-3 border-t pt-3">
                    Movie over Mini-Golf is locked first, then Board Game over
                    Movie. Mini-Golf over Board Game would cause the endless
                    cycle and was the closest vote, so it's skipped.{' '}
                    <strong>Board Game wins.</strong>
                </p>
            </figure>

            <h3 className={subheadingClass}>Ties</h3>
            <p>
                Sometimes two wins are equally strong, and which one is locked
                first changes the winner. When that happens, the poll checks
                every possible order, and every option that could win in any of
                them becomes a contender. Then:
            </p>
            <ol className="list-decimal space-y-2 pl-6">
                <li>
                    <strong>Borda score.</strong> Each ballot gives an option
                    one point for every option ranked below it. The contender
                    with the most points wins.
                </li>
                <li>
                    <strong>A drawn ballot.</strong> If the contenders are still
                    tied, one ballot is picked at random, and whichever
                    contender it ranks highest wins.
                </li>
            </ol>
            <p>
                The draw uses a random seed that's set when the poll is created
                and shown with the results.
            </p>
            <p>
                In rare cases, there are too many equally strong wins to check
                every order. Then the contenders are the options that beat or
                tie every option outside their group.
            </p>

            <h3 className={subheadingClass}>The full ranking</h3>
            <p>
                Second place is decided by running the whole process again
                without the winner, as if it had never been an option, then this
                process is repeated for the whole list.
            </p>

            <h3 className={subheadingClass}>Keeping it fair</h3>
            <ul className="list-disc space-y-2 pl-6">
                <li>
                    Each voter sees the options in a different random order, so
                    no option benefits from always being listed first.
                </li>
                <li>Each browser can vote once.</li>
                <li>
                    Results stay hidden until the poll closes, either when its
                    creator closes it or when the time they chose runs out.
                </li>
            </ul>
            <p>
                Hopefully this poll helps your group decide what they really
                want!
            </p>
        </>
    )
}
