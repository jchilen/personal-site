import { useEffect, useRef, useState, type ReactNode } from 'react'
import { IconArrowLeft, IconArrowRight, IconPlus } from '@tabler/icons-react'
import { Tabs } from 'radix-ui'
import { cn } from 'cn'
import { Eyebrow } from '@/components/eyebrow'
import { reducedMotionClass } from '@/components/motion-styles'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useFocusAfterRender } from '@/hooks/use-focus-after-render'

/** One part of the explanation, with its own place in the list down the side */
export type Chapter = {
    title: string
    content: ReactNode
}

type MethodologyDialogProps = {
    title: string
    chapters: Chapter[]
}

/**
 * A Methodology button that opens a long explanation in a dialog, split into chapters you read one
 * at a time. For tools that need the page's full width and its margins, where MethodologyLayout's
 * side panel would get in the way
 */
export function MethodologyDialog({ title, chapters }: MethodologyDialogProps) {
    // Kept out here because the dialog's content leaves the page when it closes, and anything held
    // in there would go with it. Out here it lasts until the page reloads, so reopening the dialog
    // goes back to the chapter you were reading
    const [current, setCurrent] = useState(0)
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="framed" size="sm">
                    Methodology
                    <IconPlus data-icon="inline-end" />
                </Button>
            </DialogTrigger>
            {/* No separate description: the chapters themselves follow the title */}
            <DialogContent
                aria-describedby={undefined}
                className={`flex max-h-[85svh] flex-col gap-0 p-0 max-sm:h-[85svh] sm:max-w-4xl ${reducedMotionClass}`}
            >
                <div className="border-b p-6 pr-16">
                    <Eyebrow className="font-semibold text-foreground dark:text-primary">
                        Methodology
                    </Eyebrow>
                    <DialogTitle className="mt-2 text-xl tracking-widest">
                        {title}
                    </DialogTitle>
                </div>
                <Chapters
                    chapters={chapters}
                    current={current}
                    onChange={setCurrent}
                />
            </DialogContent>
        </Dialog>
    )
}

// A chapter's place in the list, as "01", "02"... like the page's section numbers
const chapterNumber = (index: number) => String(index + 1).padStart(2, '0')

type ChaptersProps = {
    chapters: Chapter[]
    /** The open chapter, by its place in the list */
    current: number
    onChange: (index: number) => void
}

// The chapter list, the open chapter, and Back and Next
function Chapters({ chapters, current, onChange }: ChaptersProps) {
    const focusAfterRender = useFocusAfterRender()
    const backRef = useRef<HTMLButtonElement>(null)
    const nextRef = useRef<HTMLButtonElement>(null)
    // Each chapter's button in the list, so the open one can be scrolled into view
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
    const bodyRef = useRef<HTMLDivElement>(null)
    const last = chapters.length - 1
    const next = chapters.at(current + 1)

    // Back hides on the first chapter and Next on the last. If the button you pressed is the one
    // that hides, focus moves to the other, so it isn't lost
    function goTo(index: number) {
        if (index === 0) focusAfterRender(() => nextRef.current)
        else if (index === last) focusAfterRender(() => backRef.current)
        onChange(index)
    }

    // On phones the list is a single row that scrolls sideways, so Back and Next could open a
    // chapter whose chip is off screen. This brings it back into view. On wider screens the whole
    // list is always visible, so it does nothing
    // A new chapter also starts at its top, rather than wherever the last one was scrolled to
    useEffect(() => {
        bodyRef.current?.scrollTo({ top: 0 })
        tabRefs.current[current]?.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
        })
    }, [current])

    return (
        // Tabs gives the list and chapters their roles and lets the arrow keys move through the list
        <Tabs.Root
            value={String(current)}
            onValueChange={(value) => onChange(Number(value))}
            orientation="vertical"
            className="flex min-h-0 flex-1 flex-col"
        >
            {/* Scrolls only when the screen is too short for a chapter, like on a phone */}
            <div
                ref={bodyRef}
                className="min-h-0 flex-1 overflow-y-auto sm:grid sm:grid-cols-[14rem_minmax(0,1fr)]"
            >
                {/* A list down the side on wider screens. On phones it's one row of chips above the
                    chapter, swiped sideways with its scroll bar hidden, so it never pushes the text
                    off the screen */}
                <Tabs.List
                    aria-label="Chapters"
                    className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-6 pt-5 sm:flex-col sm:gap-0 sm:overflow-visible sm:border-r sm:px-0 sm:py-5"
                >
                    {chapters.map((chapter, index) => (
                        <Tabs.Trigger
                            key={chapter.title}
                            ref={(node) => {
                                tabRefs.current[index] = node
                            }}
                            value={String(index)}
                            className={cn(
                                'flex shrink-0 items-center gap-2 font-heading text-xs font-semibold tracking-widest whitespace-nowrap text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                // Phones: outlined chips, gold when open
                                'border px-2.5 py-1.5 data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary',
                                // Wider screens: a plain list with a gold bar beside the open chapter
                                'sm:border-0 sm:border-l-2 sm:border-transparent sm:px-5 sm:py-2.5 sm:text-left sm:data-[state=active]:border-primary sm:data-[state=active]:bg-primary/5 sm:data-[state=active]:text-foreground',
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className="font-mono text-primary"
                            >
                                {chapterNumber(index)}
                            </span>
                            {chapter.title}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>

                {/* On wider screens every chapter sits in the same grid cell, with only the open one
                    visible. The dialog takes the height of the longest one, so it never changes size
                    as you move between them. Phones show just the open chapter instead, since the
                    longest is far too tall for their screens */}
                <div className="grid p-6">
                    {chapters.map((chapter, index) => (
                        <Tabs.Content
                            key={chapter.title}
                            value={String(index)}
                            forceMount
                            className={cn(
                                'space-y-4 font-serif text-lg outline-none [grid-area:1/1] focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                'data-[state=active]:animate-in data-[state=active]:duration-300 data-[state=active]:fade-in-0 data-[state=inactive]:invisible max-sm:data-[state=inactive]:hidden',
                                reducedMotionClass,
                            )}
                        >
                            <h3 className="font-heading text-base font-semibold tracking-eyebrow uppercase">
                                {chapter.title}
                            </h3>
                            {chapter.content}
                        </Tabs.Content>
                    ))}
                </div>
            </div>

            {/* Hidden rather than removed at either end, so the row never shifts */}
            <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
                <Button
                    ref={backRef}
                    type="button"
                    variant="outline"
                    className={cn(current === 0 && 'invisible')}
                    onClick={() => goTo(current - 1)}
                >
                    <IconArrowLeft data-icon="inline-start" />
                    Back
                </Button>
                <p className="font-heading text-xs tracking-widest text-muted-foreground uppercase tabular-nums">
                    {current + 1} of {chapters.length}
                </p>
                <Button
                    ref={nextRef}
                    type="button"
                    variant="outline"
                    className={cn(!next && 'invisible')}
                    onClick={() => goTo(current + 1)}
                >
                    {/* One span, so the button's gap doesn't land between "Next" and the colon. The next
                        chapter's name only shows on screens with room for it */}
                    <span>
                        Next
                        {next && (
                            <span className="max-sm:hidden">
                                : {next.title}
                            </span>
                        )}
                    </span>
                    <IconArrowRight data-icon="inline-end" />
                </Button>
            </div>
        </Tabs.Root>
    )
}
