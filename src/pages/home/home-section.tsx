import type { ReactNode } from 'react'

import { Eyebrow } from '@/components/eyebrow'
import { cn } from '@/lib/utils'

type HomeSectionProps = {
    id: string
    number: string
    title: string
    wide?: boolean
    children: ReactNode
}

export function HomeSection({
    id,
    number,
    title,
    wide = false,
    children,
}: HomeSectionProps) {
    return (
        <section id={id} className="scroll-mt-28 py-32">
            <header className="flex flex-col items-center text-center">
                <Eyebrow>{number}</Eyebrow>
                <h2 className="mt-2 font-heading text-3xl font-semibold tracking-eyebrow uppercase sm:text-4xl">
                    {title}
                </h2>
                <span aria-hidden className="mt-3 h-0.5 w-8 bg-primary" />
            </header>
            <div className={cn('mx-auto mt-12', !wide && 'max-w-prose')}>
                {children}
            </div>
        </section>
    )
}