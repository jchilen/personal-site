import { useEffect, useState } from 'react'
import type { Toc } from '@stefanprobst/rehype-extract-toc'
import { cn } from 'cn'

export const ARTICLE_START_ID = 'article-start'
const ACTIVE_OFFSET = 120 // px from the top of the screen, just below the floating category bar

function headingIds(entries: Toc): string[] {
    return entries.flatMap((entry) => [
        ...(entry.id ? [entry.id] : []),
        ...headingIds(entry.children ?? []),
    ])
}

export function TableOfContents({ toc }: { toc: Toc }) {
    const [activeId, setActiveId] = useState(ARTICLE_START_ID)

    useEffect(() => {
        const ids = headingIds(toc)

        function updateActive() {
            let current = ARTICLE_START_ID
            for (const id of ids) {
                const heading = document.getElementById(id)
                if (
                    heading &&
                    heading.getBoundingClientRect().top < ACTIVE_OFFSET
                ) {
                    current = id
                }
            }
            setActiveId(current)
        }

        window.addEventListener('scroll', updateActive, { passive: true })
        return () => window.removeEventListener('scroll', updateActive)
    }, [toc])

    return (
        <nav aria-label="Table of contents">
            <ol className="space-y-0.5">
                <li>
                    <TocLink
                        id={ARTICLE_START_ID}
                        label="Introduction"
                        depth={2}
                        activeId={activeId}
                    />
                </li>
                <TocItems entries={toc} activeId={activeId} />
            </ol>
        </nav>
    )
}

function TocItems({ entries, activeId }: { entries: Toc; activeId: string }) {
    return entries.map((entry) => (
        <li key={entry.id}>
            <TocLink
                id={entry.id ?? ''}
                label={entry.value}
                depth={entry.depth}
                activeId={activeId}
            />
            {entry.children && (
                <ol className="space-y-0.5">
                    <TocItems entries={entry.children} activeId={activeId} />
                </ol>
            )}
        </li>
    ))
}

type TocLinkProps = {
    id: string
    label: string
    depth: number
    activeId: string
}

function TocLink({ id, label, depth, activeId }: TocLinkProps) {
    return (
        <a
            href={`#${id}`}
            aria-current={id === activeId ? 'location' : undefined}
            className={cn(
                'block border-l-2 border-transparent py-1 pr-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground aria-[current=location]:border-primary aria-[current=location]:text-foreground',
                depth === 2 &&
                    'pl-3 font-heading text-xs tracking-widest uppercase',
                depth === 3 && 'pl-6',
                depth === 4 && 'pl-9',
            )}
        >
            {label}
        </a>
    )
}
