import { cn } from 'cn'

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

type FigureProps = {
    src: string
    alt: string
    caption?: string
    float?: boolean
}

export function Figure({ src, alt, caption, float = false }: FigureProps) {
    return (
        <figure
            className={cn(
                'not-prose my-8',
                float &&
                    'max-sm:mx-auto max-sm:max-w-64 sm:float-left sm:mt-1 sm:mr-6 sm:mb-4 sm:w-56',
            )}
        >
            <Dialog>
                <DialogTrigger asChild>
                    <button
                        type="button"
                        className="block w-full cursor-zoom-in border bg-card p-1 transition-colors hover:border-primary"
                    >
                        <img src={src} alt={alt} loading="lazy" className="w-full" />
                        <span className="sr-only">Enlarge image</span>
                    </button>
                </DialogTrigger>
                <DialogContent
                    aria-describedby={undefined}
                    className="max-w-[95vw] rounded-none p-2 sm:max-w-[min(95vw,80rem)]"
                >
                    <DialogTitle className="sr-only">{alt}</DialogTitle>
                    <img
                        src={src}
                        alt={alt}
                        className="mx-auto max-h-[85svh] w-auto object-contain"
                    />
                </DialogContent>
            </Dialog>
            {caption && (
                <figcaption className="mt-2 text-sm text-muted-foreground">
                    {caption}
                </figcaption>
            )}
        </figure>
    )
}