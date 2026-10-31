import { cn } from 'cn'
import { IconChevronDown } from '@tabler/icons-react'
import { SectionTitle } from '@/components/section-title'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { findWins, groupByStrength, sortWins } from './ranked-pairs'
import type { PollResults } from './results'
import { describeTiebreak } from './results-text'

type ResultsDetailsProps = {
    options: string[]
    results: PollResults
}

export function ResultsDetails({ options, results }: ResultsDetailsProps) {
    const { headToHead, places, seed } = results
    const groups = groupByStrength(sortWins(findWins(headToHead)))
    const tiebreaks = places
        .map((place, index) => describeTiebreak(place, index + 1))
        .filter((text) => text !== null)

    return (
        <Collapsible className="border bg-card">
            <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 p-4 text-left font-heading text-sm tracking-eyebrow uppercase">
                Show how it was decided
                <IconChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
            </CollapsibleTrigger>

            <CollapsibleContent className="divide-y border-t">
                <section className="flex flex-col gap-3 p-4">
                    <SectionTitle>Head-to-head</SectionTitle>
                    <p className="text-sm text-muted-foreground">
                        Each cell shows how many voters ranked the row's option
                        above the column's, then the reverse.
                    </p>
                    {/* Scrolls sideways inside the card when 8 options don't fit a phone */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr>
                                    <td />
                                    {options.map((option) => (
                                        <th
                                            key={option}
                                            scope="col"
                                            className="border p-1.5 font-normal text-muted-foreground"
                                        >
                                            {option}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {options.map((rowOption, row) => (
                                    <tr key={rowOption}>
                                        <th
                                            scope="row"
                                            className="border p-1.5 text-left font-normal text-muted-foreground"
                                        >
                                            {rowOption}
                                        </th>
                                        {options.map((columnOption, column) => {
                                            if (row === column) {
                                                return (
                                                    <td
                                                        key={columnOption}
                                                        className="border p-1.5 text-center text-muted-foreground"
                                                    >
                                                        –
                                                    </td>
                                                )
                                            }
                                            const forRow =
                                                headToHead[row][column]
                                            const forColumn =
                                                headToHead[column][row]
                                            return (
                                                <td
                                                    key={columnOption}
                                                    className={cn(
                                                        'border p-1.5 text-center tabular-nums',
                                                        forRow > forColumn &&
                                                            'font-semibold text-cat-tools',
                                                        forRow < forColumn &&
                                                            'text-muted-foreground',
                                                    )}
                                                >
                                                    {forRow}–{forColumn}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="flex flex-col gap-3 p-4">
                    <SectionTitle>Wins, strongest first</SectionTitle>
                    <p className="text-sm text-muted-foreground">
                        Ranked Pairs accepts these from the top down, skipping
                        any that would contradict a stronger one.
                    </p>
                    {groups.length === 0 ? (
                        <p className="text-sm">
                            No option beat another head-to-head.
                        </p>
                    ) : (
                        <ol className="flex flex-col gap-2 text-sm">
                            {groups.map((group) => (
                                <li
                                    key={group[0].votes}
                                    className={cn(
                                        group.length > 1 &&
                                            'border-l-2 border-cat-tools pl-3',
                                    )}
                                >
                                    {group.length > 1 && (
                                        <p className="font-heading text-xs tracking-eyebrow text-muted-foreground uppercase">
                                            Equally strong
                                        </p>
                                    )}
                                    {group.map((win) => (
                                        <p key={`${win.winner}-${win.loser}`}>
                                            {options[win.winner]} over{' '}
                                            {options[win.loser]},{' '}
                                            <span className="tabular-nums">
                                                {win.votes}–
                                                {
                                                    headToHead[win.loser][
                                                        win.winner
                                                    ]
                                                }
                                            </span>
                                        </p>
                                    ))}
                                </li>
                            ))}
                        </ol>
                    )}
                </section>

                <section className="flex flex-col gap-3 p-4">
                    <SectionTitle>Tiebreaks</SectionTitle>
                    {tiebreaks.length === 0 ? (
                        <p className="text-sm">No tiebreaks were needed.</p>
                    ) : (
                        <>
                            <ul className="flex flex-col gap-2 text-sm">
                                {tiebreaks.map((text) => (
                                    <li key={text}>{text}</li>
                                ))}
                            </ul>
                            <p className="text-sm text-muted-foreground">
                                A Borda score gives an option one point for
                                every option ranked below it on each ballot.
                            </p>
                        </>
                    )}
                </section>

                <section className="flex flex-col gap-2 p-4">
                    <SectionTitle>Seed</SectionTitle>
                    <p className="text-sm text-muted-foreground">
                        Random tiebreaks draw a ballot using this value, which
                        was fixed when the poll was created.
                    </p>
                    <code className="font-mono text-sm break-all">{seed}</code>
                </section>
            </CollapsibleContent>
        </Collapsible>
    )
}
