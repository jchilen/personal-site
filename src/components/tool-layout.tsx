import type { ReactNode } from 'react'
import { CategoryBar } from '@/components/category-bar'
import { Eyebrow } from '@/components/eyebrow'

type ToolLayoutProps = {
    eyebrow: string
    title: string
    // The browser tab's title, when it should say more than the heading; defaults to the heading
    tabTitle?: string
    intro?: string
    children: ReactNode
}

export function ToolLayout({
    eyebrow,
    title,
    tabTitle = title,
    intro,
    children,
}: ToolLayoutProps) {
    return (
        <>
            <title>{`${tabTitle} // IceNine`}</title>
            <CategoryBar floating />
            <section className="pt-12 pb-16">
                <header className="flex flex-col items-center text-center">
                    <Eyebrow>{eyebrow}</Eyebrow>
                    {/* tabIndex -1 and no outline: App focuses this heading after moving to the page */}
                    <h1
                        tabIndex={-1}
                        className="mt-3 font-heading text-3xl font-semibold tracking-widest uppercase outline-none sm:text-5xl"
                    >
                        {title}
                    </h1>
                    {intro && (
                        <p className="mt-4 text-muted-foreground">{intro}</p>
                    )}
                </header>
                <div className="mt-10">{children}</div>
            </section>
        </>
    )
}
