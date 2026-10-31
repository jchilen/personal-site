import { cn } from 'cn'
import { Link } from 'react-router'
import { SectionTitle } from '@/components/section-title'
import type { MyPoll } from './api-types'

export function YourPolls({ polls }: { polls: MyPoll[] }) {
    return (
        <section className="border bg-card p-4">
            <SectionTitle>Your polls</SectionTitle>
            <ul className="mt-3 divide-y">
                {polls.map((poll) => (
                    <li key={poll.id}>
                        {/* Open polls go to their admin page, closed ones to their results */}
                        <Link
                            to={`/tools/polls/${poll.id}/${poll.closed ? 'results' : 'admin'}`}
                            className="flex items-center gap-3 py-2.5 transition-colors hover:text-cat-tools"
                        >
                            <span className="min-w-0 flex-1 truncate">
                                {poll.title}
                            </span>
                            <span
                                className={cn(
                                    'shrink-0 border px-1.5 py-0.5 font-heading text-xs tracking-eyebrow uppercase',
                                    poll.closed
                                        ? 'text-muted-foreground'
                                        : 'border-cat-tools/40 text-cat-tools',
                                )}
                            >
                                {poll.closed
                                    ? 'Closed'
                                    : `${poll.ballotCount} of ${poll.expectedVoters} voted`}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}
