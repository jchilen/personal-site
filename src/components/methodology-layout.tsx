import { useRef, useState, type ReactNode } from 'react'
import { IconArrowUp, IconMinus, IconPlus } from '@tabler/icons-react'

import { Eyebrow } from '@/components/eyebrow'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

// Where and how the methodology sits beside the tool. Wide tools keep their full width, so they
// need a bigger screen before the panel fits next to them
const LAYOUTS = {
    normal: {
        closed: 'lg:grid-cols-[minmax(0,1fr)_0rem]',
        open: 'lg:grid-cols-[minmax(0,1fr)_36rem]',
        tool: 'max-w-188',
        topOnly: 'max-lg:hidden',
        belowOnly: 'lg:hidden',
        article:
            'lg:mt-12 lg:ml-8 lg:w-136 lg:border-t-0 lg:border-l-2 lg:pt-0 lg:pl-8',
    },
    wide: {
        closed: '2xl:grid-cols-[minmax(0,1fr)_0rem]',
        // The grid grows by the panel's 36rem, half on each side, so the tool keeps its width and
        // slides left while the pair stays centered
        open: '2xl:-mx-72 2xl:grid-cols-[minmax(0,1fr)_36rem]',
        tool: 'max-w-none',
        topOnly: 'max-2xl:hidden',
        belowOnly: '2xl:hidden',
        article:
            '2xl:mt-12 2xl:ml-8 2xl:w-136 2xl:border-t-0 2xl:border-l-2 2xl:pt-0 2xl:pl-8',
    },
}

type MethodologyLayoutProps = {
    title: string
    methodology: ReactNode
    backLabel?: string
    defaultOpen?: boolean
    // Keeps the tool at the full page width, with the methodology opening beside it on big screens
    wide?: boolean
    children: ReactNode
}

export function MethodologyLayout({
    title,
    methodology,
    backLabel = 'Back to tool',
    defaultOpen = false,
    wide = false,
    children,
}: MethodologyLayoutProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const toolRef = useRef<HTMLDivElement>(null)
    const layout = LAYOUTS[wide ? 'wide' : 'normal']

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
                'grid transition-[grid-template-columns,margin] duration-300 ease-out motion-reduce:transition-none',
                isOpen ? layout.open : layout.closed,
            )}
        >
            <div
                ref={toolRef}
                className={cn(
                    '@container mx-auto w-full scroll-mt-28',
                    layout.tool,
                )}
            >
                <div className={cn('mb-4 flex justify-end', layout.topOnly)}>
                    {toggle}
                </div>
                {children}
                <div
                    className={cn('mt-8 flex justify-center', layout.belowOnly)}
                >
                    {toggle}
                </div>
            </div>

            <Collapsible open={isOpen}>
                <CollapsibleContent asChild>
                    <article
                        className={cn(
                            'mt-8 border-t-2 border-primary pt-6 duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in motion-reduce:animate-none',
                            layout.article,
                        )}
                    >
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
                            className={cn('mt-6 h-auto p-0', layout.belowOnly)}
                            onClick={() => toolRef.current?.scrollIntoView()}
                        >
                            {backLabel}
                            <IconArrowUp data-icon="inline-end" />
                        </Button>
                    </article>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}
