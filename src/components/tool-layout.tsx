import type { ReactNode } from 'react'
import { CategoryBar } from '@/components/category-bar'
import { Eyebrow } from '@/components/eyebrow'

type ToolLayoutProps = {
    eyebrow: string
    title: string
    intro: string
    children: ReactNode
}

export function ToolLayout({
    eyebrow,
    title,
    intro,
    children,
}: ToolLayoutProps) {
    return (
        <>
            <CategoryBar floating />
            <section className="pt-12 pb-16">
                <header className="flex flex-col items-center text-center">
                    <Eyebrow>{eyebrow}</Eyebrow>
                    <h1 className="mt-3 font-heading text-3xl font-semibold tracking-widest uppercase sm:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-4 text-muted-foreground">{intro}</p>
                </header>
                <div className="mt-10">{children}</div>
            </section>
        </>
    )
}
