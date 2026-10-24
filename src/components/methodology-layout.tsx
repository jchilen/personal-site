import { useRef, useState, type ReactNode } from 'react'
import { IconArrowUp, IconMinus, IconPlus } from '@tabler/icons-react'

import { Eyebrow } from '@/components/eyebrow'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type MethodologyLayoutProps = {
    title: string
    methodology: ReactNode
    backLabel?: string
    children: ReactNode
}

export function MethodologyLayout({
    title,
    methodology,
    backLabel = 'Back to tool',
    children,
}: MethodologyLayoutProps) {
    const [isOpen, setIsOpen] = useState(false)
    const toolRef = useRef<HTMLDivElement>(null)

        const toggle = (
        <Button
            variant="framed"
            size="sm"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
        >
            Methodology
            {isOpen ? (
                <IconMinus data-icon="inline-end" />
            ) : (
                <IconPlus data-icon="inline-end" />
            )}
        </Button>
    )

    return (
        <div
            className={cn(
                'grid transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none',
                isOpen
                    ? 'lg:grid-cols-[minmax(0,1fr)_36rem]'
                    : 'lg:grid-cols-[minmax(0,1fr)_0rem]',
            )}
        >
            <div
                ref={toolRef}
                className="@container mx-auto w-full max-w-188 scroll-mt-28"
            >
                <div className="mb-4 flex justify-end max-lg:hidden">
                    {toggle}
                </div>
                {children}
                <div className="mt-8 flex justify-center lg:hidden">
                    {toggle}
                </div>
            </div>

            {isOpen && (
                <article className="mt-8 animate-in border-t-2 border-primary pt-6 duration-300 fade-in motion-reduce:animate-none lg:mt-12 lg:ml-8 lg:w-136 lg:border-t-0 lg:border-l-2 lg:pt-0 lg:pl-8">
                    <Eyebrow className="font-semibold text-foreground dark:text-primary">
                        Methodology
                    </Eyebrow>
                    <h2 className="mt-2 font-heading text-xl font-semibold tracking-widest uppercase">
                        {title}
                    </h2>
                    <div className="mt-4 space-y-4 font-serif text-lg">
                        {methodology}
                    </div>
                    <Button
                        variant="link"
                        size="sm"
                        className="mt-6 h-auto p-0 lg:hidden"
                        onClick={() => toolRef.current?.scrollIntoView()}
                    >
                        {backLabel}
                        <IconArrowUp data-icon="inline-end" />
                    </Button>
                </article>
            )}
        </div>
    )
}