import type { RefObject } from 'react'
import avatar from '@/assets/icenine_avatar.png'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eyebrow } from '@/components/eyebrow'

type HeroProps = {
    nameRef: RefObject<HTMLHeadingElement | null>
}

export function Hero({ nameRef }: HeroProps) {
    return (
        <section className="pointer-events-none relative flex flex-col items-center pt-24 text-center">
            <Avatar className="mb-8 size-28 rounded-none outline-2 outline-offset-4 outline-primary after:hidden">
                <AvatarImage
                    src={avatar}
                    alt="IceNine avatar"
                    className="rounded-none"
                />
                <AvatarFallback className="rounded-none font-heading text-2xl">
                    JC
                </AvatarFallback>
            </Avatar>

            <Eyebrow className="font-semibold text-foreground dark:text-primary">
                Software Developer
            </Eyebrow>
            <span aria-hidden="true" className="mt-2 h-0.5 w-8 bg-primary" />

            <h1
                ref={nameRef}
                className="mt-4 font-heading text-4xl font-semibold tracking-widest uppercase sm:text-6xl"
            >
                Joe Chilen
            </h1>
            <p className="mt-2 font-heading text-sm tracking-eyebrow text-muted-foreground uppercase">
                IceNine
            </p>
        </section>
    )
}
