import { useState, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'
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
    float?: 'left' | 'right'
}

export function Figure({ src, alt, caption, float }: FigureProps) {
    const [isZoomed, setIsZoomed] = useState(false)

    function handleZoomClick(event: MouseEvent<HTMLButtonElement>) {
        if (isZoomed) {
            setIsZoomed(false)
            return
        }

        const image = event.currentTarget.querySelector('img')
        const scroller = event.currentTarget.parentElement
        if (!image || !scroller) return

        // Where on the image was clicked, as a fraction of its width and height
        const rect = image.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height

        // Render the zoomed image right away, then scroll that spot to the center
        flushSync(() => setIsZoomed(true))
        scroller.scrollTo({
            left: x * scroller.scrollWidth - scroller.clientWidth / 2,
            top: y * scroller.scrollHeight - scroller.clientHeight / 2,
        })
    }

    return (
        <figure
            className={cn(
                'not-prose my-8',
                float
                    ? [
                          'max-sm:mx-auto max-sm:max-w-64 sm:mt-1 sm:mb-4 sm:w-56',
                          float === 'left'
                              ? 'sm:float-left sm:mr-6'
                              : 'sm:float-right sm:ml-6',
                      ]
                    : 'clear-both',
            )}
        >
            <Dialog onOpenChange={() => setIsZoomed(false)}>
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
                    <div className="max-h-[85svh] overflow-auto">
                        <button
                            type="button"
                            onClick={handleZoomClick}
                            className={cn(
                                'block w-full',
                                isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
                            )}
                        >
                            <img
                                src={src}
                                alt={alt}
                                className={cn(
                                    'block',
                                    isZoomed
                                        ? 'max-w-none'
                                        : 'mx-auto max-h-[85svh] w-auto object-contain',
                                )}
                            />
                            <span className="sr-only">
                                {isZoomed ? 'Zoom out' : 'Zoom in'}
                            </span>
                        </button>
                    </div>
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