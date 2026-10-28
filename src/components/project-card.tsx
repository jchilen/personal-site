import type { CSSProperties } from 'react'
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
}

export function ProjectCard({
    item,
    color,
    label,
    actionLabel,
    index,
    isLeaving,
}: ProjectCardProps) {
    const Icon = item.icon
    const number = String(index + 1).padStart(2, '0')

    return (
        <Link
            to={item.href}
            className={cn(
                'group/link corner-brackets block w-60 text-left text-(--category-color) [--brackets-hover-opacity:1]',
            )}
            style={{ '--category-color': color } as CSSProperties}
        >
            <Card
                size="sm"
                className={cn(
                    'h-full gap-4 border shadow-none ring-0 motion-reduce:animate-none',
                    isLeaving ? 'animate-scan-conceal' : 'animate-scan-reveal',
                )}
            >
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
                <span
                    className="absolute inset-x-0 bottom-0 h-6 border-b-2 border-(--category-color) bg-linear-to-b from-transparent to-(--category-color)/35"
                />
            </span>
        </Link>
    )
}
