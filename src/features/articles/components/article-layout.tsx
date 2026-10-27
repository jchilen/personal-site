import type { ReactNode } from 'react'
import type { Toc } from '@stefanprobst/rehype-extract-toc'
import { IconMinus, IconPlus } from '@tabler/icons-react'

import { CategoryBar } from '@/components/category-bar'
import { Eyebrow } from '@/components/eyebrow'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ARTICLE_START_ID, TableOfContents } from './table-of-contents'

type ArticleLayoutProps = {
    title: string
    byline: string
    note?: ReactNode
    art: ReactNode
    toc: Toc
    children: ReactNode
}

export function ArticleLayout({
    title,
    byline,
    note,
    art,
    toc,
    children,
}: ArticleLayoutProps) {
    return (
        <>
            <title>{`${title} // IceNine`}</title>
            <CategoryBar floating />

            <header className="relative mt-12 border">
                {art}
                <div className="p-5 sm:absolute sm:bottom-[16%] sm:left-0 sm:max-w-[55%] sm:p-0 sm:pl-[4%]">
                    <h1 className="font-heading text-3xl font-semibold tracking-widest uppercase sm:text-4xl sm:text-white lg:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-3 font-heading text-sm tracking-eyebrow text-muted-foreground uppercase sm:text-white/80">
                        {byline}
                    </p>
                </div>
            </header>
            {note && (
                <p className="mt-3 text-sm text-muted-foreground">{note}</p>
            )}

            <div className="mt-12 grid gap-10 pb-24 lg:grid-cols-[15rem_minmax(0,1fr)]">
                <aside className="max-lg:hidden">
                    <div className="sticky top-28 max-h-[calc(100svh-8rem)] overflow-y-auto">
                        <Eyebrow className="mb-3 pl-3">Contents</Eyebrow>
                        <TableOfContents toc={toc} />
                    </div>
                </aside>

                <Collapsible className="border lg:hidden">
                    <CollapsibleTrigger className="group/toc flex w-full items-center justify-between px-4 py-3 font-heading text-xs tracking-eyebrow uppercase">
                        Contents
                        <IconPlus className="size-4 group-data-[state=open]/toc:hidden" />
                        <IconMinus className="size-4 group-data-[state=closed]/toc:hidden" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="border-t px-2 py-3">
                        <TableOfContents toc={toc} />
                    </CollapsibleContent>
                </Collapsible>

                <article
                    id={ARTICLE_START_ID}
                    className="prose prose-lg prose-site scroll-mt-28 font-serif prose-headings:scroll-mt-28 prose-headings:font-heading prose-headings:font-semibold prose-headings:tracking-wide prose-headings:uppercase prose-headings:text-balance prose-h2:clear-both prose-h3:clear-both prose-a:decoration-primary prose-a:decoration-2 prose-a:underline-offset-4 dark:prose-a:text-primary"
                >
                    {children}
                </article>
            </div>
        </>
    )
}