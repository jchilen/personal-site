import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from 'cn'
import { IconArrowUpRight } from '@tabler/icons-react'
import type { CardItem } from '@/data/categories'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

type ProjectCardProps = {
    item: CardItem
    color: string
    label: string
    actionLabel: string
    index: number
    isLeaving: boolean
    header?: ReactNode
    className?: string
}

export function ProjectCard({
    item,
    color,
    label,
    actionLabel,
    index,
    isLeaving,
    header,
    className,
}: ProjectCardProps) {
    const Icon = item.icon
    const number = String(index + 1).padStart(2, '0')

    const isExternal = item.href.startsWith('http')
    const linkClass = cn(
        'group/link corner-brackets block w-60 text-left text-(--category-color) [--brackets-hover-opacity:1]',
        className,
    )
    const linkStyle = { '--category-color': color } as CSSProperties

    // Everything inside the link, shared by both kinds of link below
    const content = (
        <>
            <Card
                size="sm"
                className={cn(
                    'h-full gap-4 border shadow-none ring-0 motion-reduce:animate-none',
                    header && 'pt-0!',
                    isLeaving ? 'animate-scan-conceal' : 'animate-scan-reveal',
                )}
            >
            {header}
                <CardHeader className="gap-3">
                    <div className="flex justify-between font-heading text-xs tracking-eyebrow text-muted-foreground uppercase">
                        <span>{label}</span>
                        <span>{number}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Icon className="size-8 shrink-0 stroke-[1.25] text-(--category-color)" />
                        <CardTitle className="text-base tracking-normal normal-case">
                            {item.title}
                        </CardTitle>
                    </div>
                </CardHeader>

                <CardContent>
                    <CardDescription>{item.description}</CardDescription>
                </CardContent>

                <CardFooter className="mt-auto gap-1.5 border-t font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase transition-colors group-hover/link:text-(--category-color) group-focus-visible/link:text-(--category-color)">
                    {actionLabel}
                        {isExternal && (
                        <span className="sr-only">(opens in a new tab)</span>
                    )}
                    <IconArrowUpRight className="size-3.5" />
                </CardFooter>
            </Card>

            <span
                aria-hidden="true"
                className={cn(
                    'pointer-events-none absolute inset-0 z-10 motion-reduce:hidden',
                    isLeaving ? 'animate-scan-line-out' : 'animate-scan-line',
                )}
            >
                <span className="absolute inset-x-0 bottom-0 h-6 border-b-2 border-(--category-color) bg-linear-to-b from-transparent to-(--category-color)/35" />
            </span>
        </>
    )

    // Links to other sites open in a new tab; links within the site go through the router
    return isExternal ? (
        <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            style={linkStyle}
        >
            {content}
        </a>
    ) : (
        <Link to={item.href} className={linkClass} style={linkStyle}>
            {content}
        </Link>
    )
}
