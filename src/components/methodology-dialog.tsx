import type { ReactNode } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { Eyebrow } from '@/components/eyebrow'
import { reducedMotionClass } from '@/components/motion-styles'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

type MethodologyDialogProps = {
    title: string
    children: ReactNode
}

/**
 * A Methodology button that opens the explanation in a dialog, for tools that need the page's full
 * width and its margins, where MethodologyLayout's side panel would get in the way
 */
export function MethodologyDialog({ title, children }: MethodologyDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="framed" size="sm">
                    Methodology
                    <IconPlus data-icon="inline-end" />
                </Button>
            </DialogTrigger>
            {/* No separate description: the explanation itself follows the title */}
            <DialogContent
                aria-describedby={undefined}
                className={`flex max-h-[85svh] flex-col gap-4 sm:max-w-2xl ${reducedMotionClass}`}
            >
                <div className="pr-10">
                    <Eyebrow className="font-semibold text-foreground dark:text-primary">
                        Methodology
                    </Eyebrow>
                    <DialogTitle className="mt-2 text-xl tracking-widest">
                        {title}
                    </DialogTitle>
                </div>
                {/* The explanation scrolls on its own, so the title and close button stay in view */}
                <div className="-mx-1 space-y-4 overflow-y-auto px-1 font-serif text-lg">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}