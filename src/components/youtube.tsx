import { useState } from 'react'
import { IconPlayerPlay } from '@tabler/icons-react'

type YouTubeProps = {
    id: string
    title: string
}

export function YouTube({ id, title }: YouTubeProps) {
    const [isPlaying, setIsPlaying] = useState(false)

    return (
        <div className="not-prose my-8 aspect-video border bg-card">
            {isPlaying ? (
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="size-full"
                />
            ) : (
                <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="group/video relative size-full"
                >
                    <img
                        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-background/85 px-4 py-2 text-left font-heading text-xs tracking-widest text-foreground uppercase">
                        {title}
                    </span>
                    <span className="absolute top-1/2 left-1/2 flex size-14 -translate-1/2 items-center justify-center border bg-background/85 text-foreground transition-colors group-hover/video:border-primary group-hover/video:text-primary">
                        <IconPlayerPlay aria-hidden className="size-6" />
                    </span>
                    <span className="sr-only">Play video</span>
                </button>
            )}
        </div>
    )
}