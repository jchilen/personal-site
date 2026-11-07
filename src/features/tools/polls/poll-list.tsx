import { cn } from 'cn'
import { Link } from 'react-router'
import { SectionTitle } from '@/components/section-title'
import { glideClass } from '@/components/motion-styles'

export type PollListItem = {
    id: string
    title: string
    to: string
    badge: string
    open: boolean
}

export function PollList({
    title,
    items,
}: {
    title: string
    items: PollListItem[]
}) {
    return (
        <section className={`border bg-card p-4 ${glideClass}`}>
            <SectionTitle>{title}</SectionTitle>
            <ul className="mt-3 divide-y">
                {items.map((item) => (
                    <li key={item.id}>
                        <Link
                            to={item.to}
                            className="flex items-center gap-3 py-2.5 transition-colors hover:text-cat-tools"
                        >
                            <span className="min-w-0 flex-1 truncate">
                                {item.title}
                            </span>
                            <span
                                className={cn(
                                    'shrink-0 border px-1.5 py-0.5 font-heading text-xs tracking-eyebrow uppercase',
                                    item.open
                                        ? 'border-cat-tools/40 text-cat-tools'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {item.badge}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}
